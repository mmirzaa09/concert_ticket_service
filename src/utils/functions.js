import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import jwksClient from 'jwks-rsa';

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

export const jwtVerify = async (token) => {
    try {
        const decodedToken = jwt.decode(token, { complete: true });
        if (!decodedToken) {
            throw new Error('Invalid token');
        }

        // If it's a Vercel OIDC token, it will have a 'kid' in the header
        if (decodedToken.header.kid && decodedToken.payload.iss?.includes('vercel')) {
            const client = jwksClient({
                jwksUri: `${decodedToken.payload.iss}/.well-known/jwks.json`
            });

            const getKey = (header, callback) => {
                client.getSigningKey(header.kid, (err, key) => {
                    const signingKey = key.publicKey || key.rsaPublicKey;
                    callback(null, signingKey);
                });
            };

            return new Promise((resolve, reject) => {
                jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(decoded);
                });
            });
        } else {
            // Fallback for your own JWTs
            return jwt.verify(token, process.env.JWT_SECRET);
        }
    } catch (error) {
        console.error("Error verifying JWT:", error);
        throw error;
    }
}
