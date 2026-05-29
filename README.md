# FlowSync - Collaborative Project Management Tool

FlowSync is a real-time, modern project management platform designed to help teams collaborate, organize workflows, and execute tasks securely. Built with a robust full-stack architecture, it features advanced Role-Based Access Control (RBAC), live WebSocket updates, and an intuitive user interface.

## 🚀 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router, FontAwesome
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io
- **Security**: JWT Authentication, bcrypt password hashing, RBAC Middleware

## ✨ Key Features
- **Real-Time Collaboration**: Instant updates across all clients using Socket.io for tasks and board states.
- **Role-Based Access Control (RBAC)**: 
  - **Superadmin**: Full system control, can elevate users to Admin status and assign custom job titles.
  - **Admin**: Can manage teams and assign job titles to members.
  - **Member**: Standard access to assigned projects and tasks.
- **Dynamic Task Boards**: Kanban-style drag-and-drop boards to track project progress.
- **Secure Authentication**: End-to-end encrypted password verification with a comprehensive settings panel.
- **Multi-Tenant Ready**: Designed with a logical isolation architecture capable of supporting multiple workspaces.

## 🔄 Project Flow & Architecture

1. **Authentication & Onboarding**
   - Users register an account and are assigned a default `Member` privilege.
   - The system automatically detects and elevates the designated `SUPERADMIN_EMAIL` to the highest privilege level upon server boot.
   - Secure login issues a JWT stored on the client.

2. **Dashboard & Navigation**
   - The user lands on the dynamic Dashboard displaying live task analytics fetched straight from the database.
   - The Sidebar provides dedicated, React-Router driven navigation to `/task`, `/team`, `/settings`, and `/support`.

3. **Workspace & Team Management (`/team`)**
   - The Team page renders all members within the workspace.
   - If the logged-in user is an Admin or Superadmin, they unlock the **"Edit Role"** UI.
   - Admins can assign custom job titles (e.g., "Lead Designer"), while Superadmins can additionally modify system access levels.

4. **Task Execution (`/task`)**
   - Projects act as the primary data-driver. Selecting a project loads the relevant Kanban board.
   - Tasks are created, modified, and tracked via isolated database queries tied to the active project.
   - Real-time updates push task modifications to all connected team members instantly.

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (or local instance)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ProjectManagementTool
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   FRONTEND_URL=http://localhost:5173
   SUPERADMIN_EMAIL=your_admin_email@domain.com
   ```

4. **Start the Development Servers:**
   The project uses `concurrently` to run both the frontend and backend simultaneously.
   ```bash
   npm run dev
   ```
   - Frontend runs on `http://localhost:5173`
   - Backend runs on `http://localhost:5000`

## 📦 Production Build
To prepare the application for deployment (compiling Vite assets and optimizing the build):
```bash
npm run build
```
