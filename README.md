# Team Task Management Web Application

A full-stack Team Task Management application built with React, Node.js, Express, and MongoDB. It features JWT authentication, role-based access control, a dashboard with summary metrics, and a dynamic Kanban board for task management.

## Tech Stack
- **Frontend**: React.js (Vite), React Router, Lucide Icons, Vanilla CSS (Modern Glassmorphism UI)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB via Mongoose
- **Auth**: JSON Web Tokens (JWT) & bcryptjs

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas cluster)

### 1. Clone & Install Dependencies
Navigate to both the `client` and `server` folders to install dependencies:
```bash
# In the server folder
cd server
npm install

# In the client folder
cd ../client
npm install
```

### 2. Environment Variables
Create a `.env` file in the `server/` directory using the provided `.env.example`:
```env
PORT=5000
DATABASE_URL=mongodb://127.0.0.1:27017/task-manager
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```
*(If you are using MongoDB Atlas, replace `DATABASE_URL` with your Atlas connection string)*

Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Run the Application
You can run the frontend and backend simultaneously in separate terminal windows:
```bash
# Terminal 1: Run Backend
cd server
npm run dev  # (Requires nodemon) or node server.js

# Terminal 2: Run Frontend
cd client
npm run dev
```

---

## Database Schema (MongoDB / Mongoose)

### 1. User
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `createdAt` (Date)

### 2. Project
- `name` (String, required)
- `description` (String)
- `createdBy` (ObjectId ref User, required)
- `members` (Array of objects containing `user` ObjectId and `role` Enum['admin', 'member'])
- `createdAt` (Date)

### 3. Task
- `title` (String, required)
- `description` (String)
- `dueDate` (Date)
- `priority` (Enum: 'low', 'medium', 'high', default: 'medium')
- `status` (Enum: 'todo', 'inprogress', 'done', default: 'todo')
- `assignedTo` (ObjectId ref User)
- `project` (ObjectId ref Project, required)
- `createdBy` (ObjectId ref User, required)
- `createdAt` (Date)

---

## Deployment Instructions (Railway.app)

This repository is configured to be easily deployed to [Railway.app](https://railway.app/) using a single service that runs the Express backend and serves the static React frontend.

1. **Push to GitHub:** Commit this code and push it to a new GitHub repository.
2. **Create Railway Project:** Log in to Railway and click **New Project** -> **Deploy from GitHub repo**.
3. **Select Repository:** Choose your Task Management repository.
4. **Add MongoDB Database (Optional):** In your Railway project, click **New** -> **Database** -> **MongoDB** to add a database, or use an external MongoDB Atlas cluster.
5. **Configure Environment Variables:** Go to your app service's **Variables** tab and add the following:
   - `DATABASE_URL` (Your Railway MongoDB URL or Atlas URL)
   - `JWT_SECRET` (A strong, random string)
   - `NODE_ENV` (Set to `production`)
   - *Note: Railway automatically provides a `PORT` variable, and our build scripts will automatically point the frontend to the same domain so you don't need `VITE_API_URL` for production since it serves from `/`.*
6. **Deploy:** Railway will detect the root `package.json`, run the `npm run build` script (which builds the Vite frontend), and then run `npm start` (which starts the Express server serving the frontend statically).

Enjoy your new Task Manager!
