# 🎓 Campus Connect

A full-featured student community platform where students can connect, share resources, find lost items, trade books, share notes, discover events, and form study groups.

[![Node.js](https://img.shields.io/badge/Node.js-22-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://docker.com)

---

## ✨ Features

- **🔐 Authentication** — JWT-based register/login, bcrypt password hashing, role-based access (student/admin)
- **📋 Posts** — Create, edit, delete, and browse posts with images and file attachments
- **🗂 Categories** — Lost & Found, Books, Notes, Events, Study Groups, General
- **🔍 Search & Filter** — Full-text search, category filter, location filter, sort options
- **❤️ Likes & Bookmarks** — Like and save your favorite posts
- **💬 Realtime Chat** — Socket.IO powered direct and group messaging
- **⚙️ Admin Dashboard** — Moderate posts, manage users, resolve reports
- **📱 Responsive UI** — Works perfectly on mobile and desktop
- **🐳 Docker** — One-command deployment with docker-compose

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js 22, Express 4 |
| Database | PostgreSQL 16 |
| Auth | JWT + bcrypt |
| Realtime | Socket.IO |
| File Uploads | Multer |
| Validation | express-validator |
| Testing | Jest + Supertest |
| Deployment | Docker + docker-compose |

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docker.com) and [Docker Compose](https://docs.docker.com/compose/) installed
- OR: Node.js 18+, PostgreSQL 14+

### Option 1: Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/pushparajadhikari/campus-connect.git
cd campus-connect

# Copy environment variables
cp .env.example .env
# Edit .env with your values (JWT_SECRET at minimum)

# Start all services
docker-compose up --build -d

# Run migrations and seed data
docker-compose exec backend node src/config/migrate.js
docker-compose exec backend node src/config/seed.js
```

Open http://localhost:3000 — done! 🎉

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install

# Create a .env file (see .env.example)
cp ../.env.example .env

# Run migrations
node src/config/migrate.js

# Seed demo data
node src/config/seed.js

# Start dev server
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install

# Create .env
echo "VITE_API_URL=http://localhost:5000/api" > .env
echo "VITE_SOCKET_URL=http://localhost:5000" >> .env

# Start dev server
npm run dev
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@campus.edu | Admin@123 |
| Student | alex@campus.edu | Student@123 |
| Student | maria@campus.edu | Student@123 |

---

## 📁 Project Structure

```
campus-connect/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, migrations, seeds
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, error handling, uploads
│   │   ├── routes/         # Express routers
│   │   └── services/       # Socket.IO service
│   ├── tests/
│   │   └── unit/           # Jest + Supertest tests
│   ├── uploads/            # User-uploaded files (gitignored)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios API clients
│   │   ├── components/     # Reusable UI components
│   │   │   ├── common/     # Avatar, Modal, Spinner, etc.
│   │   │   ├── layout/     # Navbar, Layout
│   │   │   └── posts/      # PostCard, SearchFilter, CreatePostForm
│   │   ├── context/        # React context (Auth, Socket)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helpers
│   └── Dockerfile
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get own profile (auth) |
| PUT | `/api/auth/profile` | Update profile (auth) |
| PUT | `/api/auth/change-password` | Change password (auth) |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | List posts (filter, search, paginate) |
| GET | `/api/posts/:id` | Get post details |
| POST | `/api/posts` | Create post (auth) |
| PUT | `/api/posts/:id` | Update post (auth, owner/admin) |
| DELETE | `/api/posts/:id` | Delete post (auth, owner/admin) |
| GET | `/api/posts/categories` | List categories |
| POST | `/api/posts/:postId/like` | Toggle like (auth) |
| POST | `/api/posts/:postId/bookmark` | Toggle bookmark (auth) |
| GET | `/api/posts/bookmarks` | Get user's bookmarks (auth) |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard stats (admin) |
| GET | `/api/admin/users` | List users (admin) |
| PUT | `/api/admin/users/:id/status` | Activate/deactivate user (admin) |
| PUT | `/api/admin/posts/:id/status` | Moderate post (admin) |
| GET | `/api/admin/reports` | List reports (admin) |
| PUT | `/api/admin/reports/:id` | Resolve report (admin) |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chat/rooms` | Get user's chat rooms (auth) |
| POST | `/api/chat/rooms` | Create chat room (auth) |
| GET | `/api/chat/rooms/:id/messages` | Get messages (auth) |

### Socket.IO Events
| Event | Direction | Description |
|---|---|---|
| `join_room` | Client → Server | Join a chat room |
| `send_message` | Client → Server | Send a message |
| `typing` | Client → Server | Typing indicator |
| `new_message` | Server → Client | New message received |
| `user_typing` | Server → Client | Someone is typing |

---

## 🧪 Running Tests

```bash
cd backend
npm test
# or with coverage
npm run test:coverage
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret for JWT signing | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:3000` |
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` |

---

## 🛡 Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT with configurable expiry
- Helmet.js security headers
- Rate limiting on auth endpoints (20 req/15min) and API (200 req/15min)
- Input validation via express-validator
- SQL injection prevention via parameterized queries
- CORS configured for specific origins

---

## 📝 License

MIT
