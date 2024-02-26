import { Token } from "../Services/Token.js";

/**
 * Verifies the token provided in the header
 * 
 * @param {any} request
 * @param {any} response
 * @param {any} next
 */
export const verifyTokenMiddleware = (request: any, response: any, next: any) => {

    const token = request.headers.authorization;

    if (!token) {
        return response.status(403).json({
            message: 'There is no token provided'
        });
    }

    if (!Token.isValid(token)) {
        return response.status(403).json({
            message: 'Invalid token'
        });
    }

    next();
}