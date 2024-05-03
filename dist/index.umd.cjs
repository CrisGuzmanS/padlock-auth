(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('arrowy-env'), require('jsonwebtoken')) :
    typeof define === 'function' && define.amd ? define(['exports', 'arrowy-env', 'jsonwebtoken'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PadlockAuth = {}, global.ArrowyEnv, global.jwt));
})(this, (function (exports, arrowyEnv, jwt) { 'use strict';

    class Token {
        static isValid(token) {
            if (!token) {
                return false;
            }
            try {
                jwt.verify(token, arrowyEnv.env('JWT_SECRET_KEY'));
            }
            catch (error) {
                return false;
            }
            return true;
        }
        static create(payload) {
            return jwt.sign(payload, arrowyEnv.env('JWT_SECRET_KEY'), {
                expiresIn: arrowyEnv.env('JWT_EXPIRES_IN', '2h')
            });
        }
    }

    const verifyTokenMiddleware = (request, response, next) => {
        if (arrowyEnv.env('VERIFY_TOKEN') === 'false') {
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

    exports.Token = Token;
    exports.verifyTokenMiddleware = verifyTokenMiddleware;

}));
