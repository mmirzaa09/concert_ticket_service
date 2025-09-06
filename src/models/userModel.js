import dbConnect from '../config/db.config.js';
import bycrypt from 'bcrypt';
import { encryptionPassword, jwtGenerate } from '../utils/functions.js';
import * as response from '../utils/responseHandler.js';

export const getAllUsersModel = async () => {
    const client = await dbConnect.connect();
    try {
        const result = await client.query('SELECT * FROM tbl_users');
        const usersWithoutPassword = result.rows.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return usersWithoutPassword;
    } catch {
        client.release();
    }
};

export const postRegisterUserModel = async (userData) => {
    const client = await dbConnect.connect();
    try {
        const { name, email, password, phone_number } = userData;

        // Check if email already exists
        const emailCheckResult = await client.query('SELECT * FROM tbl_users WHERE email = $1', [email]);
        if (emailCheckResult.rows.length > 0) {
            const message = 'Email already exists';
            throw message;
        }

        const hashedPassword = await encryptionPassword(password);
        const result = await client.query(
            'INSERT INTO tbl_users (name, email, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, phone_number]
        );
        
        // Return user data without password
        const { password: userPassword, ...userWithoutPassword } = result.rows[0];
        return userWithoutPassword;
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

export const postLoginUserModel = async (email, password) => {
    const client = await dbConnect.connect();
    try {
        const result = await client.query('SELECT * FROM tbl_users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        const user = result.rows[0];
        const isPasswordValid = await bycrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const { password: hashedPassword, ...userWithoutPassword } = user;
        const token = jwtGenerate(email);

        return {...userWithoutPassword, token};
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};