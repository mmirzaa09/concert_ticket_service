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
        const result = await client.query("SELECT * FROM tbl_orders WHERE id_user = $1", [id_user]);
        if (result.rows.length === 0) {
            const message = 'Order not found';
            throw message;
        }
        return result.rows[0];
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
            INSERT INTO tbl_orders (id_user, id_concert, quantity, total_price, status, reservation_expired)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            id_user,
            id_concert,
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