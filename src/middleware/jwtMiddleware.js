import { jwtVerify } from '../utils/functions.js';
import * as response from '../utils/responseHandler.js';

export const authenticateJWT = (req, res, next) => {
    // const token = req.headers['authorization']?.split(' ')[1];
    const oidcToken = req.headers['x-vercel-oidc-token'];
    const authHeader = req.headers['authorization'];

    let token;

    if (oidcToken) {
        token = oidcToken;
    } else if (authHeader) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return response.unauthorized(res, 'Access denied. No token provided.');
    }

    try {
        const decoded = jwtVerify(token);
        req.user = decoded;
        next();
    } catch (error) {
        return response.unauthorized(res, 'Invalid token');
    }
}