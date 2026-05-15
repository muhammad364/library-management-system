# Library Management System (DevOps Assignment)

A simple and minimalist full-stack web app built with JavaScript, Express, and MongoDB.

## Features

- Admin login (basic credential check)
- Add a new book
- View all books
- Edit a book
- Delete a book
- Data persisted in MongoDB

## Tech Stack

- Backend: Node.js + Express + Mongoose
- Frontend: HTML + CSS + Vanilla JavaScript
- Database: MongoDB

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment file:

   - Copy `.env.example` to `.env`
   - Update values if needed

3. Make sure MongoDB is running locally.

4. Start the app:

   ```bash
   npm run dev
   ```

   or

   ```bash
   npm start
   ```

5. Open:

   - `http://localhost:5000`

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`

(You can change these in `.env`)

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/student-login`
- `GET /api/books`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
<<<<<<< HEAD
- `POST /api/books/:id/borrow`
- `POST /api/books/:id/return`
- `GET /health`

## Docker Containerization

Build the image:

```bash
docker build -t library-management-app .
```

Run the container:

```bash
docker run -d -p 5000:5000 --env-file .env library-management-app
```

Or with MongoDB via Docker Compose:

```bash
docker compose up -d
```

## Deployment Note for EC2

- Push this project to GitHub.
- Clone on EC2.
- Install Node.js and MongoDB (or use MongoDB Atlas).
- Set `.env` on EC2.
- Run with process manager (PM2) and expose port in security group.
=======
>>>>>>> 2282b0db7d7c6b00e3a99f6c6f785ebbed1310d1
