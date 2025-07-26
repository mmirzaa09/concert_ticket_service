import { jwtVerify } from '../utils/functions.js';
import * as response from '../utils/responseHandler.js';

export const authenticateJWT = (req, res, next) => {
    const token = req.headers['authentication']?.split(' ')[1];

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