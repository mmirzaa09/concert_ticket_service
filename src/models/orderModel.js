import dbConnect from "../config/db.config.js";

export const getAllOrderModel = async () => {
    const client = await dbConnect.connect();
    try {
        const result = await client.query("SELECT * FROM tbl_orders");
        return result.rows;
    } catch (error) {
        console.log("Error fetching orders:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getOrderByIdUserModel = async (id_user) => {
    const client = await dbConnect.connect();
    try {
        const query = `
            SELECT 
                o.*,
                c.id_concert,
                c.title,
                c.artist,
                c.venue,
                c.date,
                c.price,
                c.available_tickets,
                c.description,
                c.image_url
            FROM tbl_orders o
            JOIN tbl_concerts c ON o.id_concert = c.id_concert
            WHERE o.id_user = $1
            ORDER BY o.created_at DESC
        `;
        
        const result = await client.query(query, [id_user]);
        if (result.rows.length === 0) {
            throw new Error('Orders not found for this user');
        }
        
        // Transform the data to have nested concert object
        const ordersWithConcerts = result.rows.map(row => {
            const {
                id_concert,
                title,
                artist,
                venue,
                date,
                price,
                available_tickets,
                description,
                image_url,
                ...orderData
            } = row;

            return {
                ...orderData,
                concert: {
                    id_concert,
                    title,
                    artist,
                    venue,
                    date,
                    price,
                    available_tickets,
                    description,
                    image_url,
                }
            };
        });

        return ordersWithConcerts;
    } catch (error) {
        console.log("Error fetching order by ID:", error);
        throw error;
    } finally {
        client.release();
    }
}

export const postCreateOrderModel = async (orderData) => {
    const client = await dbConnect.connect();
    try {
        const {
            id_user,
            id_concert,
            id_method,
            quantity,
            total_price,
            status = 'pending',
            reservation_expired,
        } = orderData;

        const userCheck = await client.query(
            "SELECT id_user FROM tbl_users WHERE id_user = $1",
            [id_user]
        );

        if (userCheck.rows.length === 0) {
            const message = 'User not found';
            throw message;
            return;
        }

        const concertCheck = await client.query(
            "SELECT id_concert, available_tickets FROM tbl_concerts WHERE id_concert = $1",
            [id_concert]
        );

        if (concertCheck.rows.length === 0) {
            const message = 'Concert not found';
            throw message;
            return;
        }

        if (concertCheck.rows[0].available_tickets < quantity) {
            const message = 'Not enough available tickets';
            throw message;
            return;
        }

        const query = `
            INSERT INTO tbl_orders (id_user, id_concert, id_method, quantity, total_price, status, reservation_expired)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            id_user,
            id_concert,
            id_method,
            quantity,
            total_price,
            status,
            reservation_expired
        ];

        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.log("Error creating order:", error);
        throw error;
    } finally {
        client.release();
    }
};