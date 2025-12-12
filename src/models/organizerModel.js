import dbConnect from '../config/db.config.js';
import bycrypt from 'bcrypt';
import { encryptionPassword, jwtGenerate } from '../utils/functions.js';

export const getAllOrganizersModel = async () => {
    const client = await dbConnect.connect();
    try {
        const result = await client.query('SELECT * FROM tbl_organizers');
        const organizersWithoutPassword = result.rows.map(organizer => {
            const { password, ...organizerWithoutPassword } = organizer;
            return organizerWithoutPassword;
        });
        return organizersWithoutPassword;
    } catch (error) {
        console.error('Error fetching organizers:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const postRegisterOrganizerModel = async (organizerData) => {
    const client = await dbConnect.connect();
    try {
        const { name, email, password, phone_number, address, role } = organizerData;

        // Check if email already exists
        const emailCheckResult = await client.query('SELECT * FROM tbl_organizers WHERE email = $1', [email]);
        if (emailCheckResult.rows.length > 0) {
            throw new Error(`Email ${email} already exists`);
        }

        // Generate salt and hash password
        const passwordHash = await encryptionPassword(password);
        const result = await client.query(
            'INSERT INTO tbl_organizers (name, email, phone_number, address, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, email, phone_number, address, passwordHash, role]
        );

        // Return organizer data without password fields
        const { password: userPassword, ...organizerWithoutPassword } = result.rows[0];
        return organizerWithoutPassword;
    } catch (error) {
        console.error('Error registering organizer:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const postLoginOrganizerModel = async (email, password) => {
    const client = await dbConnect.connect();
    try {
        // Fetch organizer by email
        const result = await client.query('SELECT * FROM tbl_organizers WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new Error('Organizer not found');
        }

        const organizer = result.rows[0];

        // Verify password
        const isPasswordValid = await bycrypt.compare(password, organizer.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = jwtGenerate({ id: organizer.id, email: organizer.email });

        // Return organizer data without password fields and include token
        const { password: hashedPassword, ...organizerWithoutPassword } = organizer;
        return { ...organizerWithoutPassword, token };
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

export const updateOrganizerStatusModel = async (id_organizer, status) => {
    const client = await dbConnect.connect();
    try {
        // Check if organizer exists
        const checkResult = await client.query(
            'SELECT * FROM tbl_organizers WHERE id_organizer = $1',
            [id_organizer]
        );

        if (checkResult.rows.length === 0) {
            throw new Error('Organizer not found');
        }

        // Update organizer status
        const result = await client.query(
            'UPDATE tbl_organizers SET status = $1 WHERE id_organizer = $2 RETURNING *',
            [status, id_organizer]
        );

        const { password, ...organizerWithoutPassword } = result.rows[0];
        return organizerWithoutPassword;
    } catch (error) {
        console.error('Error updating organizer status:', error);
        throw error;
    } finally {
        client.release();
    }
};