# 🎵 MusicCatalog - Full-Stack Music Management System

## Project Objective
The **MusicCatalog** is a robust, full-stack web application designed to provide a premium music discovery and management experience. It serves as a modern platform for users to explore a diverse library of songs while providing administrative tools for catalog maintenance.

## Key Features

### 👤 User Experience
- **Personalized Library**: Users can create, manage, and delete their own private playlists.
- **Strict Privacy**: A secure isolation system ensures that regular users can only see their own playlists and admin-curated public content.
- **Smart Discovery**: Advanced filtering by language (Tamil, Hindi, English), genre, and artist, with real-time search capabilities.
- **Interactive Player**: A persistent, feature-rich audio player with shuffle, repeat, and volume control that stays active across navigation.
- **Smart Playback**: Intuitive one-click toggle to play, pause, or resume tracks.

### 🛡️ Administrative Control
- **Catalog Management**: Admins have exclusive rights to add, edit, or remove songs from the global database.
- **Curated Content**: Ability to create and manage global playlists visible to all users.
- **System Monitoring**: Secure dashboard for overseeing the entire music ecosystem.

## Technical Architecture
- **Frontend**: React.js with Tailwind CSS for a responsive, Spotify-inspired UI.
- **Backend**: Node.js and Express.js providing a secure RESTful API.
- **Database**: MySQL for robust relational data management (Users, Songs, Playlists).
- **Security**: JWT (JSON Web Tokens) for secure authentication and role-based access control (RBAC).
- **Data Integration**: Automated seeding using the iTunes Search API to ensure high-quality audio streams and metadata.

## Goal
The goal of this mini-project is to demonstrate the integration of complex database relationships with a modern, user-centric frontend, focusing on performance, security, and aesthetic excellence.
