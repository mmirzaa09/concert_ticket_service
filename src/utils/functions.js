import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const encryptionPassword = async (password) => {
    const saltRounds = 10;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("Error encrypting password:", error);
        throw error;
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error("Error comparing passwords:", error);
        throw error;
    }
};

export const jwtGenerate = (email) => {
    try {
        const payload = {
            email: email
        };
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1800s' });
    } catch (error) {
        console.error("Error generating JWT:", error);
        throw error;
    }
}

export const jwtVerify = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error("Error verifying JWT:", error);
        throw error;
    }
}