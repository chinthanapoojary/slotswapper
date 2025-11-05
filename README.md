# SlotSwapper - Peer-to-Peer Time Slot Scheduling

SlotSwapper is a web application that allows users to swap their busy calendar slots with other users. Built with React, Node.js/Express, and SQLite.

## Project Structure

```
slotswapper/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── server.js
│   │   ├── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── events.js
│   │       └── swaps.js
│   ├── package.json
│   └── slotswapper.db (created on first run)
│
└── frontend/         # React app
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   ├── api/
    │   │   └── client.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── components/
    │   │   └── Navbar.js
    │   └── pages/
    │       ├── Login.js
    │       ├── Signup.js
    │       ├── Dashboard.js
    │       ├── Marketplace.js
    │       └── Notifications.js
    ├── public/
    │   └── index.html
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   JWT_SECRET=your-super-secret-key-change-this
   ```

4. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create a new user account |
| POST | `/api/auth/login` | Login and receive JWT token |

**Sign Up Request:**
```json
{
  "name": "chinthana",
  "email": "chinthana@example.com",
  "password": "securepassword"
}
```

**Login Request:**
```json
{
  "email": "chinthana@example.com",
  "password": "securepassword"
}
```

### Events

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/events` | Get all your events | Yes |
| GET | `/api/events/:id` | Get a specific event | Yes |
| POST | `/api/events` | Create a new event | Yes |
| PUT | `/api/events/:id` | Update an event | Yes |
| DELETE | `/api/events/:id` | Delete an event | Yes |

**Create Event Request:**
```json
{
  "title": "Team Meeting",
  "startTime": "2024-01-15T10:00:00",
  "endTime": "2024-01-15T11:00:00"
}
```

### Swaps

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/api/swaps/swappable-slots` | Get all swappable slots from other users | Yes |
| GET | `/api/swaps/requests/incoming` | Get incoming swap requests | Yes |
| GET | `/api/swaps/requests/outgoing` | Get outgoing swap requests | Yes |
| POST | `/api/swaps/request` | Create a swap request | Yes |
| POST | `/api/swaps/response/:requestId` | Accept or reject a swap request | Yes |

**Swap Request:**
```json
{
  "mySlotId": 1,
  "theirSlotId": 2
}
```

**Swap Response:**
```json
{
  "accept": true
}
```

## Features Implemented

### Core Features
- ✅ User authentication with JWT
- ✅ Event CRUD operations
- ✅ Mark events as swappable
- ✅ Browse other users' swappable slots
- ✅ Request swaps
- ✅ Accept/reject swap requests
- ✅ Automatic slot ownership transfer on accepted swaps
- ✅ Protected routes

### Frontend
- ✅ Sign up and login pages
- ✅ Dashboard with calendar events
- ✅ Marketplace to browse available swaps
- ✅ Notifications page for incoming/outgoing requests
- ✅ Real-time UI updates
- ✅ Error handling and user feedback

### Backend
- ✅ SQLite database
- ✅ JWT authentication
- ✅ Comprehensive API endpoints
- ✅ Input validation
- ✅ Proper error handling

## Key Design Decisions

1. **SQLite Database**: Chosen for simplicity and no external dependencies required
2. **JWT Authentication**: Stateless authentication sent as Bearer token in headers
3. **Event Status Enum**: BUSY → SWAPPABLE → SWAP_PENDING → BUSY
4. **Atomic Swap Operations**: All slot updates happen in a single transaction to prevent race conditions
5. **Client-side State Management**: Using React Context for authentication state
6. **Axios HTTP Client**: Easy-to-use HTTP client with request interceptors for token handling

## Running the Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

Then open `http://localhost:3000` in your browser.

## Testing the Application

1. Sign up two accounts
2. Create events in each account
3. Make events swappable in the Dashboard
4. Go to Marketplace and request swaps
5. Check Notifications to see incoming/outgoing requests
6. Accept swaps to see calendar update

## Potential Enhancements

- Add unit and integration tests
- Implement WebSocket for real-time notifications
- Add email notifications
- Deploy to cloud providers (Vercel, Render, Heroku)
- Add Docker containerization
- Implement calendar UI (grid view)
- Add user profile pages
- Add search and filter functionality
- Add timezone support

## Troubleshooting

**Port already in use**: Change PORT in `.env` or kill the process using the port

**CORS errors**: Ensure frontend and backend URLs match in configuration

**Database locked**: This can happen with concurrent SQLite writes. Consider migrating to PostgreSQL for production

**Token expired**: Login again to get a fresh token


