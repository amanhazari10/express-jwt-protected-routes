# Implement Protected Routes with JWT Verification

A Node.js and Express.js backend application demonstrating JWT-based authentication and protected routes. This project shows how to secure API endpoints using JSON Web Tokens and implement proper authorization checks.

## Objective

Learn how to secure backend API routes using JSON Web Tokens (JWT) to ensure that only authenticated users can access certain resources. This task helps you understand:

- Token-based authentication
- JWT token generation and verification
- Server-side JWT validation
- Protecting specific routes from unauthorized access

## Task Description

This project implements a complete JWT authentication system with:

1. **Login Route** - Issues a JWT token when valid user credentials are provided (hardcoded sample user)
2. **JWT Verification Middleware** - Verifies JWT tokens sent in the Authorization header as Bearer tokens
3. **Protected Routes** - Routes that can only be accessed with a valid JWT token
4. **Testing** - Comprehensive testing with and without valid tokens to confirm proper authorization

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **jsonwebtoken** - JWT creation and verification
- **dotenv** - Environment variable management

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Steps

1. Clone the repository:
```bash
git clone https://github.com/amanhazari10/express-jwt-protected-routes.git
cd express-jwt-protected-routes
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
PORT=3000
JWT_SECRET=your_secret_key_here
```

4. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Project Structure

```
express-jwt-protected-routes/
├── server.js              # Main server file
├── package.json           # Project dependencies
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
└── README.md              # This file
```

## API Endpoints

### 1. Login Endpoint

**POST** `/api/login`

Issues a JWT token for valid credentials.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

### 2. Protected Route - User Profile

**GET** `/api/profile`

Returns user profile information. Requires valid JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "User profile data",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "message": "No token provided" or "Invalid token"
}
```

### 3. Protected Route - User Data

**GET** `/api/user-data`

Returns protected user data. Requires valid JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "This is protected user data",
  "data": {
    "userId": 1,
    "accessLevel": "admin"
  }
}
```

**Error Response (401):**
```json
{
  "message": "No token provided" or "Invalid token"
}
```

## Testing with cURL

### 1. Test Login (Get Token)

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

Expected response:
```json
{"message":"Login successful","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

### 2. Test Protected Route WITHOUT Token (Should Fail)

```bash
curl http://localhost:3000/api/profile
```

Expected response (401):
```json
{"message":"No token provided"}
```

### 3. Test Protected Route WITH Valid Token (Should Succeed)

First, get a token from the login endpoint, then:

```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response (200):
```json
{"message":"User profile data","user":{"id":1,"username":"admin","email":"admin@example.com"}}
```

### 4. Test Protected Route WITH Invalid Token (Should Fail)

```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer invalid_token_here"
```

Expected response (401):
```json
{"message":"Invalid token"}
```

### 5. Test Another Protected Route

```bash
curl http://localhost:3000/api/user-data \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response (200):
```json
{"message":"This is protected user data","data":{"userId":1,"accessLevel":"admin"}}
```

## How It Works

### JWT Verification Middleware

The middleware extracts the Bearer token from the Authorization header and verifies it:

```javascript
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Token Generation

When credentials are valid, a JWT token is created with a secret:

```javascript
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

### Route Protection

Protected routes use the middleware:

```javascript
app.get('/api/profile', verifyToken, (req, res) => {
  res.json({ message: 'User profile data', user: req.user });
});
```

## Hardcoded Credentials

For demo purposes, the following credentials are hardcoded:

- **Username:** admin
- **Password:** password123

In a production environment, use proper user authentication with hashed passwords and a database.

## Environment Variables

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT signing (should be strong and unique)

## Features

✅ JWT token generation on successful login
✅ JWT token verification middleware
✅ Protected routes with authorization
✅ Bearer token extraction from headers
✅ Error handling for missing and invalid tokens
✅ Hardcoded user credentials for testing
✅ Comprehensive API documentation
✅ cURL testing examples

## Security Notes

- **DO NOT** hardcode credentials in production
- **DO NOT** expose your JWT_SECRET in the code
- Use strong, randomly generated secrets for JWT_SECRET
- Implement proper password hashing (bcrypt, argon2)
- Use HTTPS in production
- Store tokens securely on the client side
- Consider token expiration and refresh token mechanisms
- Implement rate limiting to prevent brute force attacks

## Future Enhancements

- User registration endpoint
- Refresh token mechanism
- Role-based access control (RBAC)
- Token blacklisting/logout
- Password hashing with bcrypt
- Database integration (MongoDB, PostgreSQL)
- More granular permission system
- JWT refresh token rotation

## Troubleshooting

### Issue: "Cannot find module 'jsonwebtoken'"
**Solution:** Run `npm install` to install dependencies

### Issue: "Invalid token" error
**Solution:** Make sure you're using the correct token from the login endpoint and the JWT_SECRET is consistent

### Issue: Server won't start
**Solution:** Check if port 3000 is in use, or change the PORT in .env file

## License

MIT License - feel free to use this project for learning purposes.

## Author

Created for learning JWT authentication concepts.

## References

- [JWT.io Documentation](https://jwt.io/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/)
- [jsonwebtoken npm Package](https://www.npmjs.com/package/jsonwebtoken)
