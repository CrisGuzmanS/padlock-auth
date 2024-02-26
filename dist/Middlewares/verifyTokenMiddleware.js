import { Token } from "../Services/Token.js";
export const verifyTokenMiddleware = (request, response, next) => {
    const token = request.headers.authorization;
    if (!token) {
        return response.status(403).json({
            message: 'No se proporcionó ningún token'
        });
    }
    if (!Token.isValid(token)) {
        return response.status(403).json({
            message: 'Credenciales inválidas'
        });
    }
    next();
};
