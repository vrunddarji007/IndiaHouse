# IndiaHomes Backend

This is the backend for the advanced Real Estate Platform "IndiaHomes". Built with Node.js, Express, Mongoose, and Socket.io.

## Features
- JWT Authentication & Role-based access (Buyer, Agent, Admin)
- RESTful API for Properties, Favorites, Messages
- Real-time chatting with Socket.io
- Advanced pagination & fuzzy search filtering for properties
- Express-validator & Helmet for security constraints
- Multer configuration for file uploads

## Setup Instructions
1. Install dependencies
   ```bash
   npm install
   ```

2. Create a `.env` file from the example
   ```bash
   cp .env.example .env
   ```
   **Configure your parameters**:
   - `PORT=3000`
   - `MONGODB_URI=mongodb://127.0.0.1:27017/indiahomes`
   - `JWT_SECRET=super_secret_jwt_key_here_india_homes`

3. Run the development server
   ```bash
   npm run dev
   ```
