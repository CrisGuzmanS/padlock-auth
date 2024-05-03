import { Token } from "../Services/Token.js";
import { env } from 'arrowy-env';
export const verifyTokenMiddleware = (request, response, next) => {
    if (env('VERIFY_TOKEN') === 'false') {
        return next();
    }
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
};
