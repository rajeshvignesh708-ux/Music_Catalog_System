# Spotify-Clone: Music Catalog System

A production-ready full-stack Music Catalog web application built with a modern stack, providing a clear separation of frontend, backend, and database layers.

## 🧱 Technology Stack

* **Frontend:** React.js (Vite), Tailwind CSS, React Router DOM, Axios, Context API
* **Backend:** Node.js, Express.js, REST Architecture, JWT Authentication, bcrypt
* **Database:** MySQL

## 📂 Project Structure

```
/dbms
├── backend/            # Express.js REST API server
│   ├── config/         # Database and app configurations
│   ├── controllers/    # Business logic for routes
│   ├── middleware/     # Auth and validation middleware
│   ├── routes/         # Express route definitions
│   ├── .env            # Backend environment variables
│   └── server.js       # Backend entry point
├── frontend/           # React application (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global state (Auth, Player)
│   │   ├── pages/      # Route pages (Home, Login, Register)
│   │   ├── App.jsx     # Main React container
│   │   └── main.jsx    # React entry point
│   ├── tailwind.config.js
│   └── package.json
├── database/           # Database setup and migrations
│   └── schema.sql      # MySQL schema and dummy data
└── README.md
```

## 🚀 Setup & Deployment Instructions

### 1. Database Setup

1. Make sure you have a local MySQL server running (e.g., XAMPP, MySQL Workbench).
2. Create a new database named `music_catalog`.
3. Import the `database/schema.sql` file into your MySQL database to create the necessary tables and populate them with dummy data.

### 2. Backend Setup

1. Open a terminal and navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Check the `.env` file to ensure the database credentials match your local MySQL setup:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=music_catalog
    JWT_SECRET=supersecretjwtkey
    ```
4. Start the backend server: `npm run dev` (uses nodemon for hot-reloading) or `node server.js`
5. The API will be available at `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. Access the application in your browser at `http://localhost:5173`

## 🧩 API Documentation

### Auth Endpoints
* `POST /api/auth/register`: Register a new user (Requires `name`, `email`, `password`)
* `POST /api/auth/login`: Login user and receive JWT

### Song Endpoints
* `GET /api/songs`: Get all songs (Supports query params: `search`, `genre`, `page`, `limit`)
* `POST /api/songs`: Add a new song (Admin only, requires JWT)
* `PUT /api/songs/:id`: Update an existing song (Admin only, requires JWT)
* `DELETE /api/songs/:id`: Delete a song (Admin only, requires JWT)

### Playlist Endpoints
* `POST /api/playlists`: Create a new playlist (Requires JWT, `name`)
* `GET /api/playlists/user/:userId`: Get all playlists for a specific user (Requires JWT)
* `GET /api/playlists/:id`: Get a specific playlist and its songs (Requires JWT)
* `POST /api/playlists/:id/add-song`: Add a song to a playlist (Requires JWT, `songId`)
* `DELETE /api/playlists/:id/remove-song/:songId`: Remove a song from a playlist (Requires JWT)

## 🔐 Security Features

* **Password Hashing:** Passwords are encrypted using bcrypt before being stored.
* **JWT Authentication:** Stateful routes are protected via JWT.
* **Role-based Access:** Only users with an `admin` role can add, update, or delete songs. Regular users can only manage their own playlists.

## 🎵 Features Included
* Spotify-inspired dark UI with Tailwind CSS.
* Functional frontend Audio Player (Play/Pause, Next/Prev, Volume Control, Progress Bar).
* Full User Authentication Flow (Sign Up, Log In).
* Browsing and Searching for songs.
