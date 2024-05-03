# 🔒 padlock-auth

Middleware & Services to implement token creation & validation for express app.

## 🚀 Quick start

1. Install the package:
```shell
npm install padlock-auth
```

2. create the `.env` file in the project root:
```
touch .env
```

3. define the `JWT_SECRET_KEY` variable in the `.env` file:
```
JWT_SECRET_KEY = "<your-random-string>"
```

4. Set the middleware for all protected routes:
```js
router.post('/api/users', verifyTokenMiddleware, createUserController);
```

5. Create the token where you need it:
```js
const token = Token.create({ userId: user.id });
```

6. (Optional) define the time the token will expire in the `.env` file (by default expires in 2 hours):
```
JWT_EXPIRES_IN = '2h'
```

7. (Optional and not recomendable) define if you want to disable the token verification in the `.env` file:
```
VERIFY_TOKEN = 'false'
```