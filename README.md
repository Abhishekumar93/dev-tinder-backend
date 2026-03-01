# DevTinder Backend

A RESTful API for DevTinder - a professional networking platform connecting developers.

## 🛠️ Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Schema validation

## 📁 Project Structure

```
src/
├── app.ts                          # Express app & error handling
├── config/
│   ├── db.ts                       # MongoDB connection
│   ├── env.ts                      # Environment config
│   └── shutdown.ts                 # Graceful shutdown
├── constant/
│   ├── enum.ts                     # Enums & constants
│   ├── index.ts                    # Exports
│   └── responseMessage.ts          # API messages
├── controller/
│   ├── auth.controller.ts          # Auth logic
│   ├── user.controller.ts          # User management
│   ├── connectionRequests.controller.ts  # Connection logic
│   └── index.ts                    # Exports
├── interfaceAndTypes/              # TypeScript interfaces
├── middleware/
│   ├── auth.middleware.ts          # JWT verification
│   ├── validate.middleware.ts      # Request validation
│   └── index.ts                    # Exports
├── models/                         # Mongoose schemas
├── routes/                         # API routes
├── SchemaValidator/                # Zod schemas
├── types/                          # Type augmentation
└── utils/
    ├── jwtToken.ts                 # JWT utilities
    ├── password.ts                 # Password hashing
    ├── errorFormator.ts            # Error handling
    └── index.ts                    # Exports
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build & Production

```bash
npm run build
npm start
```

## 🔑 Key Features

- **User Authentication** - Sign up, login with password/OTP
- **Profile Management** - Update user details and password
- **Connection Requests** - Send and manage connection requests
- **Feed System** - Discover other developers with pagination
- **JWT Authorization** - Secure cookie-based tokens
- **Input Validation** - Zod schema validation on all routes
- **Error Handling** - Comprehensive error formatting
- **Graceful Shutdown** - Clean process termination

## 👤 Author

Abhishek Kumar
