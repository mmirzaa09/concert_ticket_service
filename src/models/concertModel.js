import dbConnect from "../config/db.config.js";

export const getAllConcertsModel = async () => {
  const client = await dbConnect.connect();
  try {
    const result = await client.query("SELECT * FROM tbl_concerts");
    return result.rows;
  } catch (error) {
    console.log("Error fetching concerts:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const postCreateConcertModel = async (concertData) => {
    const client = await dbConnect.connect();
    try {
        const {
            title,
            artist,
            date,
            venue,
            price,
            image_url,
            description,
            total_tickets,
            status = 0,
            id_organizer,
        } = concertData;

        const organizerCheck = await client.query(
            "SELECT id_organizer FROM tbl_organizers WHERE id_organizer = $1",
            [id_organizer]
        );

        if (organizerCheck.rows.length === 0) {
            const message = 'Organizer not found';
            throw message;
        }

        const query = `
            INSERT INTO tbl_concerts (title, artist, date, venue, price, image_url, description, total_tickets, available_tickets, status, id_organizer)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            title,
            artist,
            date,
            venue,
            price,
            image_url,
            description,
            total_tickets,
            status,
            id_organizer,
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.log("Error creating concert:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getConcertByIdModel = async (concertId) => {
    const client = await dbConnect.connect();
    try {
        const result = await client.query("SELECT * FROM tbl_concerts WHERE id_concert = $1", [concertId]);
        return result.rows[0];
    } catch (error) {
        console.log("Error fetching concert by ID:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const updateConcertQuotaModel = async (id_concert, quantity) => {
    const client = await dbConnect.connect();
    try {
        // First check if concert exists and has enough tickets
        const checkQuery = "SELECT available_tickets FROM tbl_concerts WHERE id_concert = $1";
        const checkResult = await client.query(checkQuery, [id_concert]);
        
        if (checkResult.rows.length === 0) {
            throw new Error('Concert not found');
        }
        
        const currentTickets = checkResult.rows[0].available_tickets;
        if (currentTickets < quantity) {
            throw new Error('Insufficient tickets available');
        }
        
        // Update available tickets
        const updateQuery = `
            UPDATE tbl_concerts 
            SET available_tickets = available_tickets - $1 
            WHERE id_concert = $2 
            RETURNING *
        `;
        
        const result = await client.query(updateQuery, [quantity, id_concert]);
        return result.rows[0];
    } catch (error) {
        console.log("Error updating concert quota:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const restoreTicketsModel = async (id_concert, quantity) => {
    const client = await dbConnect.connect();
    try {
        const updateQuery = `
            UPDATE tbl_concerts 
            SET available_tickets = available_tickets + $1 
            WHERE id_concert = $2 
            RETURNING *
        `;
        
        const result = await client.query(updateQuery, [quantity, id_concert]);
        return result.rows[0];
    } catch (error) {
        console.log("Error restoring concert tickets:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getConcertByOrganizerModel = async (id_organizer) => {
    const client = await dbConnect.connect();
    try {
        const result = await client.query("SELECT * FROM tbl_concerts WHERE id_organizer = $1", [id_organizer]);
        return result.rows;
    } catch (error) {
        console.log("Error fetching concerts by organizer:", error);
        throw error;
    } finally {
        client.release();
    }
};