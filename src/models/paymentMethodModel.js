import dbConnect from '../config/db.config.js';

export const getAllPaymentMethodsModel = async () => {
    const client = await dbConnect.connect();
    try {
        const result = await client.query("SELECT * FROM tbl_payment_method");
        return result.rows;
    } catch (error) {
        console.log("Error fetching payment methods:", error);
        throw error;
    } finally {
        client.release();
    }
};

export const postPaymentMethodModel = async (paymentData) => {
    const client = await dbConnect.connect();
    try {
        const { name, icon, type, number, account_name } = paymentData;
        const result = await client.query(
            "INSERT INTO tbl_payment_method (name, icon, type, number, account_name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, icon, type, number, account_name]
        );

        return result.rows[0];
    } catch (error) {
        console.log("Error creating payment method:", error);
        throw error;
    } finally {
        client.release();
    }
};