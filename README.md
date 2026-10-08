# Full-Stack To-Do App

A full-stack task manager built with React, Vite, Express, MongoDB, Mongoose, JWT, and bcrypt.

## Features

- User registration and login
- JWT authentication
- Create, edit, delete tasks
- Mark tasks complete/incomplete
- Priority levels
- Due dates
- Filter by all/active/completed
- Search tasks
- User-specific tasks
- Responsive UI

## Requirements

- Node.js 18+
- MongoDB Atlas account or a local MongoDB server

## 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/todo_app
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

## 2. Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

## API

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Todos

- `GET /api/todos`
- `POST /api/todos`
- `GET /api/todos/:id`
- `PUT /api/todos/:id`
- `DELETE /api/todos/:id`

Todo routes require:

```text
Authorization: Bearer <jwt>
```

## MongoDB Atlas

If using Atlas, replace `MONGODB_URI` with your Atlas connection string.

Never commit `.env` to GitHub.

## Production

Build the frontend:

```bash
cd client
npm run build
```

Set the deployed frontend URL in the backend's `CLIENT_URL`, and set the deployed API URL in the frontend's `VITE_API_URL`.
