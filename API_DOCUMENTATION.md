# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require an `Authorization` header:
```
Authorization: Bearer {token}
```

Tokens are obtained from login/register endpoints and are valid for 7 days by default.

---

## Auth Endpoints

### 1. Register
Create a new user account.

**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "name": "John Doe"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "image": null
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response (400):**
```json
{
  "message": "Email already registered"
}
```

---

### 2. Login
Authenticate with email and password.

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "image": null
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

### 3. Logout
End the user session.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Get Current User
Retrieve the authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "customer",
  "image": null,
  "provider": "email",
  "emailVerified": null,
  "lastLogin": "2026-04-10T10:30:00.000Z",
  "isActive": true
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized"
}
```

---

### 5. Update Profile
Update user profile information.

**Endpoint:** `PUT /auth/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "Jane Doe",
  "image": "https://example.com/image.jpg"
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "customer",
    "image": "https://example.com/image.jpg"
  }
}
```

---

### 6. Forgot Password
Request a password reset email.

**Endpoint:** `POST /auth/forgot-password`

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent",
  "resetToken": "random_token_for_dev" // Only in development
}
```

---

### 7. Reset Password
Reset password using a reset token.

**Endpoint:** `POST /auth/reset-password`

**Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error Response (400):**
```json
{
  "message": "Invalid or expired reset token"
}
```

---

### 8. Verify Email
Verify user email address.

**Endpoint:** `POST /auth/verify-email`

**Body:**
```json
{
  "email": "user@example.com",
  "token": "verification_token"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

### 9. OAuth Login
Login or register using OAuth provider.

**Endpoint:** `POST /auth/oauth-login`

**Body:**
```json
{
  "provider": "google",
  "email": "user@gmail.com",
  "name": "John Doe",
  "image": "https://example.com/avatar.jpg",
  "id": "google_id"
}
```

**Success Response (200):**
```json
{
  "message": "OAuth login successful",
  "user": {
    "id": "user_id",
    "email": "user@gmail.com",
    "name": "John Doe",
    "role": "customer",
    "image": "https://example.com/avatar.jpg"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Health Check

### Check Server Status
**Endpoint:** `GET /api/health`

**Success Response (200):**
```json
{
  "message": "Server is running"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "code": "too_small",
      "minimum": 8,
      "type": "string",
      "path": ["password"],
      "message": "String must contain at least 8 character(s)"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## User Roles

The following roles are available:
- `customer` - Regular customer
- `vendor` - Shop owner/vendor
- `delivery` - Delivery person
- `admin` - Platform administrator
- `super_admin` - Super administrator

---

## Auth Providers

Supported authentication providers:
- `email` - Email/password authentication
- `google` - Google OAuth
- `github` - GitHub OAuth

---

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 500  | Server Error |

---

## Rate Limiting

Currently not implemented. Recommended to add:
- 5 login attempts per 15 minutes
- 3 password reset requests per hour
- 100 requests per minute for general endpoints

---

## Token Format

JWT tokens contain the following payload:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "customer",
  "provider": "email",
  "iat": 1712755800,
  "exp": 1713360600
}
```

---

## Cookies

When using HTTP-only cookies (if enabled):
- Cookie name: `token`
- Path: `/`
- Secure: `true` (production only)
- SameSite: `strict`
- Max-Age: 7 days (or 30 days if rememberMe=true)

---

## CORS Configuration

The API accepts requests from:
- `http://localhost:3000` (development)
- Configured via `CLIENT_URL` env variable

Allowed methods:
- GET, POST, PUT, DELETE, PATCH

Allowed headers:
- Content-Type
- Authorization

---

## Examples

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }),
});

const data = await response.json();
console.log(data.token);

// Get current user
const userResponse = await fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${data.token}`,
  },
});

const user = await userResponse.json();
console.log(user);
```

---

## Testing with Postman

1. Create environment with variable: `token = ""`
2. In login request, add script:
   ```javascript
   pm.environment.set("token", pm.response.json().token);
   ```
3. Use `{{token}}` in Authorization header for protected endpoints

---

## Future Endpoints (To Implement)

- Vendor registration and management
- Product management
- Order management
- Delivery assignment
- Payment processing
- Ratings and reviews
- Admin features

---

**Last Updated:** April 10, 2026
**API Version:** 1.0.0
