import dbConnect from "../config/db.config.js";

export const getAllConcerts = async () => {
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

export const postCreateConcert = async (concertData) => {
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
