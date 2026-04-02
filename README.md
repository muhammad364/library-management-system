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
- `GET /api/books`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
