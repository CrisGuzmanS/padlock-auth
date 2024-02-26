import { Token } from "../Services/Token.js";

/**
 * Valida que el usuario esté autenticado al hacer peticiones en las URL.
 */
export const verifyTokenMiddleware = (request: any, response: any, next: any) => {

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
}