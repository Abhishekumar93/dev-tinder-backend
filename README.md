# DevTinder Backend

A robust, production-grade RESTful API backend for **DevTinder** — a developer networking platform designed to help software engineers discover, connect, and collaborate with peer developers based on skills, interests, and background.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime & Language** | Node.js (v20+) & TypeScript (v5+) | Strict type safety and modern JavaScript execution |
| **Web Framework** | Express 5 | Web framework with native async error handling |
| **Database & ODM** | MongoDB & Mongoose (v8) | Document database with schema definitions & indexes |
| **Validation** | Zod (v4) & validator.js | Strong request validation for body, params, and query |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `bcrypt` | Secure HttpOnly cookie-based session management |
| **Testing** | Vitest, Supertest, MongoDB Memory Server | Isolated integration tests with v8 code coverage |
| **Code Quality** | ESLint 9 (Flat Config), Prettier | Linting and code formatting standards |
| **CI/CD** | GitHub Actions | Automated lint, test, and build pipeline |

---

## ✨ Key Features

- **Authentication & Authorization**: Cookie-based JWT sessions (`HttpOnly`, `SameSite`), password hashing via `bcrypt`, and protected route middleware.
- **Developer Profiles**: View, update allowed profile attributes (skills, bio, about, age, gender, profile picture), and change credentials securely.
- **Feed & Discovery Engine**: Filtered recommendation feed that excludes the authenticated user as well as anyone already interacted with (interested, ignored, accepted, or rejected), with pagination support (`page`, `limit`).
- **Connection Request Lifecycle**: Full state-machine support for sending (`interested`, `ignored`) and reviewing (`accepted`, `rejected`) requests with strict relationship guards.
- **Connections & Pending Requests**: Retrieve accepted connections and incoming pending connection requests with populated user summaries.
- **Health & Diagnostics**: `/health` endpoint for uptime monitoring and container orchestration health checks.
- **Robust Error Handling**: Centralized error formatting that maps Mongoose validation errors, Zod validation issues, and HTTP status codes cleanly.
- **Graceful Shutdown**: Handles `SIGTERM`, `SIGINT`, uncaught exceptions, and unhandled rejections with connection draining and database teardown.

---

## 📁 Project Structure

```text
dev-tinder-backend/
├── .github/
│   └── workflows/
│       └── ci.yml                      # CI pipeline (lint, test, build)
├── src/
│   ├── app.ts                          # Express app configuration & server bootstrap
│   ├── config/
│   │   ├── db.ts                       # MongoDB connection lifecycle
│   │   ├── env.ts                      # Environment variable loader & assertions
│   │   └── shutdown.ts                 # Graceful termination handler
│   ├── constant/
│   │   ├── enum.ts                     # Enums & constants (Gender, Status)
│   │   ├── index.ts                    # Re-exports
│   │   └── responseMessage.ts          # Centralized response and error messages
│   ├── controller/
│   │   ├── auth.controller.ts          # Signup, login, logout controllers
│   │   ├── user.controller.ts          # Profile, feed, and connections controllers
│   │   ├── connectionRequests.controller.ts # Send and review request controllers
│   │   └── index.ts                    # Re-exports
│   ├── interfaceAndTypes/              # TypeScript types & DTO definitions
│   ├── middleware/
│   │   ├── auth.middleware.ts          # JWT authentication middleware
│   │   ├── validate.middleware.ts      # Generic Zod request validator
│   │   └── index.ts                    # Re-exports
│   ├── models/
│   │   ├── user.model.ts               # User Mongoose schema & indexes
│   │   ├── connectionRequest.model.ts  # Connection request schema & compound indexes
│   │   └── index.ts                    # Re-exports
│   ├── routes/
│   │   ├── auth.ts                     # /api/auth routes
│   │   ├── user.ts                     # /api/user routes
│   │   ├── connectionRequests.ts       # /api/connection-requests routes
│   │   └── index.ts                    # Re-exports
│   ├── SchemaValidator/                # Zod schemas for input validation
│   ├── types/                          # Express Request type augmentations
│   └── utils/
│       ├── errorFormator.ts            # Error formatting utility
│       ├── htttpError.ts               # Custom HTTP Error class
│       ├── jwtToken.ts                 # JWT signing and verification
│       ├── password.ts                 # Password hashing & comparison
│       ├── queries.ts                  # Query string numeric validation helpers
│       └── index.ts                    # Re-exports
├── tests/
│   ├── env.ts                          # Test environment variable definitions
│   ├── setup.ts                        # In-memory MongoDB setup/teardown helpers
│   ├── auth.test.ts                    # Auth endpoint integration tests
│   ├── user.test.ts                    # User & feed endpoint integration tests
│   └── connectionRequests.test.ts      # Connection request integration tests
├── eslint.config.cjs                   # ESLint 9 flat configuration
├── vitest.config.ts                    # Vitest configuration & coverage thresholds
├── tsconfig.json                       # TypeScript compiler options
└── package.json
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **MongoDB**: Local instance or MongoDB Atlas URI (not required for running tests)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Abhishekumar93/dev-tinder-backend.git
cd dev-tinder-backend
npm install --legacy-peer-deps
```

### Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Type | Description | Example |
|---|---|---|---|
| `NODE_ENV` | String | Application runtime environment | `development` / `production` / `test` |
| `PORT` | Number | Server listening port | `8000` |
| `MONGO_URI` | String | MongoDB connection URI string | `mongodb://localhost:27017/devtinder` |
| `JWT_SECRET` | String | Secret key for signing JWTs (min 32 characters) | `your_secure_32_character_secret_key` |
| `JWT_EXPIRES_IN` | String | Lifetime of authentication token | `86400` (1 day in seconds) |
| `FRONTEND_ORIGIN` | String | CORS allowed origin | `http://localhost:5173` |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts server with live-reloading via `tsx watch` |
| `npm run build` | Compiles TypeScript into the `dist/` directory |
| `npm start` | Runs the compiled production build from `dist/app.js` |
| `npm test` | Runs the complete integration test suite with Vitest |
| `npm run test:watch` | Runs test runner in interactive watch mode |
| `npm run test:coverage` | Generates a v8 code coverage report (enforces ≥85% thresholds) |
| `npm run lint` | Lints the codebase using ESLint 9 |
| `npm run format` | Auto-formats codebase using Prettier |

---

## 📡 API Reference

### Health Check

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/health` | No | Returns server liveness status and timestamp |

### Authentication (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | No | Register a new user account |
| `POST` | `/api/auth/login` | No | Authenticate with email + password (or OTP) and set JWT cookie |
| `POST` | `/api/auth/logout` | No | Invalidate session by clearing JWT cookie |

### User Management (`/api/user`)

All user endpoints require an authenticated session cookie.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user/` | Fetch current logged-in user profile |
| `PATCH` | `/api/user/` | Update profile fields (`firstName`, `lastName`, `age`, `gender`, `profilePic`, `about`, `bio`) |
| `PATCH` | `/api/user/update-password` | Update account password (enforces strong password policy) |
| `DELETE` | `/api/user/` | Delete the authenticated user account |
| `GET` | `/api/user/feed` | Paginated feed of prospective developers (supports `?page=1&limit=10`) |
| `GET` | `/api/user/list` | Public directory listing of developers |
| `GET` | `/api/user/connections` | List all accepted connections for current user |
| `GET` | `/api/user/pending-requests` | List all incoming `interested` requests sent to current user |

### Connection Requests (`/api/connection-requests`)

All connection request endpoints require an authenticated session cookie.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/connection-requests/send/:status/:receiverId` | Send a request to `:receiverId`. `:status` must be `interested` or `ignored` |
| `POST` | `/api/connection-requests/review/:status/:senderId` | Review an incoming request from `:senderId`. `:status` must be `accepted` or `rejected` |

---

## 🔄 Connection Request Workflow

```
               [ User A browses Feed ]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   "interested"                        "ignored"
(Saved to DB, visible to B)      (Excluded from future feeds)
        │
        ▼
 [ User B checks Pending Requests ]
        │
        ├────────────────────────────────┐
        ▼                                ▼
    "accepted"                       "rejected"
(Both are now Connections)     (Request dismissed)
```

1. **Self-action guard**: Users cannot send requests to or review requests from themselves.
2. **Duplicate guard**: Compound index on `{ sender, receiver }` ensures unique pairs.
3. **Feed filtering**: Feed queries query the `ConnectionRequest` collection for all interactions involving the user, excluding those IDs from recommendations.

---

## 🧪 Testing & Code Coverage

Tests are executed with **Vitest** and run against an isolated **MongoDB Memory Server** for fast, zero-dependency testing without external database requirements.

```bash
# Run tests
npm test

# Run tests with coverage report
npm run test:coverage
```

### Coverage Thresholds (Enforced ≥85%)

- Statements: ≥85% (Achieved: **~94%**)
- Branches: ≥80% (Achieved: **~80.4%**)
- Functions: ≥85% (Achieved: **~94.6%**)
- Lines: ≥85% (Achieved: **~94%**)

---

## 🔗 Related Repositories

- **Frontend Application**: [DevTinder Frontend](https://github.com/Abhishekumar93/dev-tinder-frontend)

---

## 📌 Known Limitations & Future Enhancements

- **OTP Authentication**: The OTP login pathway is structured in the schema and controller for demonstration purposes and currently accepts mock values.
- **Rate Limiting**: Not currently enabled; recommended for high-throughput production environments using `express-rate-limit`.
- **Real-Time Messaging**: Real-time chat between accepted connections can be integrated via WebSockets/Socket.io.

---

## 👤 Author

**Abhishek Kumar**
- GitHub: [@Abhishekumar93](https://github.com/Abhishekumar93)
