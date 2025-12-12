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

export const getOrderByIdModel = async (id_order) => {
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
            WHERE o.id_order = $1
        `;
        
        const result = await client.query(query, [id_order]);
        if (result.rows.length === 0) {
            throw new Error('Order not found');
        }
        
        const row = result.rows[0];
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
    } catch (error) {
        console.log("Error fetching order by ID:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getPaidOrderByIdModel = async (id_order) => {
    const client = await dbConnect.connect();
    try {
        const query = `
            SELECT 
                o.*,
                u.id_user,
                u.name AS user_name,
                u.email AS user_email,
                u.phone_number AS user_phone,
                c.id_concert,
                c.title AS concert_title,
                c.artist,
                c.venue,
                c.date AS concert_date,
                c.price AS concert_price,
                c.available_tickets,
                c.description AS concert_description,
                c.image_url AS concert_image
            FROM tbl_orders o
            JOIN tbl_users u ON o.id_user = u.id_user
            JOIN tbl_concerts c ON o.id_concert = c.id_concert
            WHERE o.id_order = $1 AND o.status = 'completed'
        `;

        const result = await client.query(query, [id_order]);

        if (result.rows.length === 0) {
            throw new Error('Paid order not found with this ID');
        }

        const row = result.rows[0];
        const {
            id_user,
            user_name,
            user_email,
            user_phone,
            id_concert,
            concert_title,
            artist,
            venue,
            concert_date,
            concert_price,
            available_tickets,
            concert_description,
            concert_image,
            ...orderData
        } = row;

        return {
            ...orderData,
            user: {
                id_user,
                name: user_name,
                email: user_email,
                phone_number: user_phone
            },
            concert: {
                id_concert,
                title: concert_title,
                artist,
                venue,
                date: concert_date,
                price: concert_price,
                available_tickets,
                description: concert_description,
                image_url: concert_image
            }
        };
    } catch (error) {
        console.log("Error fetching paid order by ID:", error);
        throw error;
    } finally {
        client.release();
    }
};

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

export const updateOrderStatusModel = async (orderId, newStatus) => {
    const client = await dbConnect.connect();
    try {
        const query = `
            UPDATE tbl_orders
            SET status = $1
            WHERE id_order = $2
            RETURNING *
        `;
        const values = [newStatus, orderId];
        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Order not found or could not be updated.');
        }
        return result.rows[0];
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getOrdersByOrganizerModel = async (id_organizer) => {
    const client = await dbConnect.connect();
    try {
        const query = `
            SELECT 
                o.id_order,
                u.name AS customerName,
                u.email AS customerEmail,
                c.title AS concertTitle,
                o.total_price AS amount,
                o.status,
                m.type AS paymentMethod,
                DATE(o.created_at) AS bookingDate
            FROM tbl_orders o
            JOIN tbl_users u ON o.id_user = u.id_user
            JOIN tbl_concerts c ON o.id_concert = c.id_concert
            JOIN tbl_payment_method m ON o.id_method = m.id_method
            WHERE c.id_organizer = $1
            ORDER BY o.created_at DESC
        `;
        
        const result = await client.query(query, [id_organizer]);
        
        if (result.rows.length === 0) {
            return [];
        }

        console.log("Orders fetched for organizer:", result.rows);

        const transformedData = result.rows.map(row => ({
            id: row.id_order.toString(),
            customerName: row.customername,
            customerEmail: row.customeremail,
            concertTitle: row.concerttitle,
            amount: row.amount,
            status: row.status,
            paymentMethod: row.paymentmethod,
            bookingDate: row.bookingdate.toISOString().split('T')[0] // Format as YYYY-MM-DD
        }));
        
        return transformedData;

        // const ordersWithDetails = result.rows.map(row => {
        //     const {
        //         user_name,
        //         user_email,
        //         user_phone,
        //         id_concert,
        //         concert_title,
        //         artist,
        //         venue,
        //         concert_date,
        //         concert_price,
        //         available_tickets,
        //         concert_description,
        //         concert_image,
        //         payment_method,
        //         ...orderData
        //     } = row;

        //     return {
        //         ...orderData,
        //         user: {
        //             name: user_name,
        //             email: user_email,
        //             phone_number: user_phone
        //         },
        //         concert: {
        //             id_concert,
        //             title: concert_title,
        //             artist,
        //             venue,
        //             date: concert_date,
        //             price: concert_price,
        //             available_tickets,
        //             description: concert_description,
        //             image_url: concert_image
        //         },
        //         payment_method
        //     };
        // });

        // return ordersWithDetails;
    } catch (error) {
        console.log("Error fetching orders by organizer:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getListOrderDetailModel = async () => {
    const client = await dbConnect.connect();
    try {
        const query = `
            SELECT 
                o.id_order,
                u.name AS customerName,
                u.email AS customerEmail,
                c.title AS concertTitle,
                o.total_price AS amount,
                o.status,
                m.type AS paymentMethod,
                DATE(o.created_at) AS bookingDate
            FROM tbl_orders o
            JOIN tbl_users u ON o.id_user = u.id_user
            JOIN tbl_concerts c ON o.id_concert = c.id_concert
            JOIN tbl_payment_method m ON o.id_method = m.id_method
            ORDER BY o.created_at DESC
        `;
        
        const result = await client.query(query);
        if (result.rows.length === 0) {
            throw new Error('No orders found');
        }
        
        // Transform the data to match the exact structure you want
        const transformedData = result.rows.map(row => ({
            id: row.id_order.toString(),
            customerName: row.customername,
            customerEmail: row.customeremail,
            concertTitle: row.concerttitle,
            amount: row.amount,
            status: row.status,
            paymentMethod: row.paymentmethod,
            bookingDate: row.bookingdate.toISOString().split('T')[0] // Format as YYYY-MM-DD
        }));
        
        return transformedData;
    } catch (error) {
        console.log("Error fetching orders with details:", error);
        throw error;
    } finally {
        client.release();
    }
};
