import dbConnect from "../config/db.config.js";

export const getAllTransactionsModel = async () => {
    const client = await dbConnect.connect();
    try {
        const query = `
            SELECT 
                t.*,
                o.id_user,
                o.id_concert,
                o.quantity,
                o.total_price,
                o.status as order_status,
                c.title as concert_title,
                c.artist,
                c.venue,
                c.date as concert_date,
                u.name as user_name,
                u.email as user_email
            FROM tbl_transactions t
            JOIN tbl_orders o ON t.id_order = o.id_order
            JOIN tbl_concerts c ON o.id_concert = c.id_concert
            JOIN tbl_users u ON o.id_user = u.id_user
            ORDER BY t.created_at DESC
        `;
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.log("Error fetching transactions:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getTransactionByIdModel = async (id_transaction) => {
    const client = await dbConnect.connect();
    try {
        const query = `
            SELECT 
                t.*,
                o.id_user,
                o.id_concert,
                o.quantity,
                o.total_price,
                o.status as order_status,
                c.title as concert_title,
                c.artist,
                c.venue,
                c.date as concert_date,
                u.name as user_name,
                u.email as user_email
            FROM tbl_transactions t
            JOIN tbl_orders o ON t.id_order = o.id_order
            JOIN tbl_concerts c ON o.id_concert = c.id_concert
            JOIN tbl_users u ON o.id_user = u.id_user
            WHERE t.id_transaction = $1
        `;
        const result = await client.query(query, [id_transaction]);
        
        if (result.rows.length === 0) {
            throw new Error('Transaction not found');
        }
        
        return result.rows[0];
    } catch (error) {
        console.log("Error fetching transaction by ID:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getTransactionsByOrderIdModel = async (id_order) => {
    const client = await dbConnect.connect();
    try {
        const query = `
            SELECT 
                t.*,
                o.id_user,
                o.id_concert,
                o.quantity,
                o.total_price,
                o.status as order_status
            FROM tbl_transactions t
            JOIN tbl_orders o ON t.id_order = o.id_order
            WHERE t.id_order = $1
            ORDER BY t.created_at DESC
        `;
        const result = await client.query(query, [id_order]);
        return result.rows;
    } catch (error) {
        console.log("Error fetching transactions by order ID:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getTransactionsByUserIdModel = async (id_user) => {
    const client = await dbConnect.connect();
    try {
        const query = `
            SELECT 
                t.*,
                o.id_order,
                o.id_concert,
                o.quantity,
                o.total_price,
                o.status as order_status,
                c.title as concert_title,
                c.artist,
                c.venue,
                c.date as concert_date
            FROM tbl_transactions t
            JOIN tbl_orders o ON t.id_order = o.id_order
            JOIN tbl_concerts c ON o.id_concert = c.id_concert
            WHERE o.id_user = $1
            ORDER BY t.created_at DESC
        `;
        const result = await client.query(query, [id_user]);
        return result.rows;
    } catch (error) {
        console.log("Error fetching transactions by user ID:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const createTransactionModel = async (transactionData) => {
    const client = await dbConnect.connect();
    try {
        // First check if order exists
        const orderCheck = await client.query("SELECT * FROM tbl_orders WHERE id_order = $1", [transactionData.id_order]);
        if (orderCheck.rows.length === 0) {
            throw new Error('Order not found');
        }

        const query = `
            INSERT INTO tbl_transactions (
                id_order,
                id_user,
                payment_date,
                payment_proof_url,
                transaction_status,
                created_at,
                updated_at
            ) 
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        
        const values = [
            transactionData.id_order,
            transactionData.id_user,
            transactionData.payment_date || null,
            transactionData.payment_proof_url || null,
            transactionData.transaction_status || 'pending'
        ];
        
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.log("Error creating transaction:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const updateTransactionModel = async (id_transaction, transactionData) => {
    const client = await dbConnect.connect();
    try {
        // First check if transaction exists
        const transactionCheck = await client.query("SELECT * FROM tbl_transactions WHERE id_transaction = $1", [id_transaction]);
        if (transactionCheck.rows.length === 0) {
            throw new Error('Transaction not found');
        }

        const query = `
            UPDATE tbl_transactions 
            SET 
                payment_date = COALESCE($1, payment_date),
                payment_proof_url = COALESCE($2, payment_proof_url),
                transaction_status = COALESCE($3, transaction_status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id_transaction = $4 
            RETURNING *
        `;
        
        const values = [
            transactionData.payment_date,
            transactionData.payment_proof_url,
            transactionData.transaction_status,
            id_transaction
        ];
        
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.log("Error updating transaction:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const updateTransactionStatusModel = async (id_transaction, transaction_status) => {
    const client = await dbConnect.connect();
    try {
        // First check if transaction exists
        const transactionCheck = await client.query("SELECT * FROM tbl_transactions WHERE id_transaction = $1", [id_transaction]);
        if (transactionCheck.rows.length === 0) {
            throw new Error('Transaction not found');
        }

        // Validate status
        const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
        if (!validStatuses.includes(transaction_status)) {
            throw new Error('Invalid transaction status');
        }

        const query = `
            UPDATE tbl_transactions 
            SET 
                transaction_status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_transaction = $2 
            RETURNING *
        `;
        
        const result = await client.query(query, [transaction_status, id_transaction]);
        return result.rows[0];
    } catch (error) {
        console.log("Error updating transaction status:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const deleteTransactionModel = async (id_transaction) => {
    const client = await dbConnect.connect();
    try {
        // First check if transaction exists
        const transactionCheck = await client.query("SELECT * FROM tbl_transactions WHERE id_transaction = $1", [id_transaction]);
        if (transactionCheck.rows.length === 0) {
            throw new Error('Transaction not found');
        }

        const query = "DELETE FROM tbl_transactions WHERE id_transaction = $1 RETURNING *";
        const result = await client.query(query, [id_transaction]);
        return result.rows[0];
    } catch (error) {
        console.log("Error deleting transaction:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const getTransactionStatsModel = async () => {
    const client = await dbConnect.connect();
    try {
        const query = `
            SELECT 
                COUNT(*) as total_transactions,
                COUNT(CASE WHEN transaction_status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN transaction_status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN transaction_status = 'failed' THEN 1 END) as failed_count,
                COUNT(CASE WHEN transaction_status = 'cancelled' THEN 1 END) as cancelled_count,
                COALESCE(SUM(CASE WHEN transaction_status = 'completed' THEN o.total_price END), 0) as total_revenue
            FROM tbl_transactions t
            JOIN tbl_orders o ON t.id_order = o.id_order
        `;
        const result = await client.query(query);
        return result.rows[0];
    } catch (error) {
        console.log("Error fetching transaction stats:", error);
        throw error;
    } finally {
        client.release();
    }
};