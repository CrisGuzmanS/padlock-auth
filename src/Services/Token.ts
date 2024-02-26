import { env } from 'arrowy-env';
import jwt from 'jsonwebtoken';

export class Token {

    static isValid(token: string) {
        if (!token) {
            return false;
        }

        try {
            jwt.verify(token, env('JWT_SECRET_KEY'));
        } catch (error) {
            return false;
        }

        return true;
    }

    static create(payload: any) {
        jwt.sign(payload, env('JWT_SECRET_KEY'), env('JWT_EXPIRES_IN', '2h'));
    }
}