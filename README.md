# EstateAI - AI-Powered Real Estate Marketplace Platform

EstateAI is a modern full-stack web application connecting property buyers, sellers, and agents. Built with a premium glassmorphic UI, it features a natural language AI Assistant, personalized recommendation engines, comparison matrix overlays, visit scheduling workflows, and real-time Socket.io messaging with typing states and read receipts.

## Technical Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion, Axios, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js, Socket.io, Mongoose (MongoDB ORM), Helmet & CORS Security.
- **AI Service**: Google Gemini API SDK (`@google/genai`) for conversational search parsing, marketing content generation, and pricing trends.
- **Storage**: Cloudinary (integrated with Multer buffer memory stream).

---

## Directory Structure

```
/Users/porandlarajkumar/Documents/REAL ESTATE/
├── backend/
│   ├── config/          # db.js, aiConfig.js, cloudinary.js
│   ├── models/          # User, Property, Booking, Review, Message, Notification
│   ├── controllers/     # Auth, Property, Booking, Review, Chat, Recommendation, AI, Admin
│   ├── routes/          # Auth, Properties, Bookings, Reviews, Chats, Recommendations, AI, Admin
│   ├── middleware/      # authMiddleware, uploadMiddleware, errorMiddleware
│   ├── services/        # aiService.js
│   ├── server.js        # Server boot + Socket.io event listeners
│   └── seed.js          # DB Prepopulating script
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, PropertyCard, ComparisonPanel
│   │   ├── context/     # AuthContext, ChatContext
│   │   ├── pages/       # Home, PropertyDetails, AiAssistant, Dashboard, Login, Chat
│   │   ├── App.jsx      # Page router mounts
│   │   └── index.css    # Global Tailwind layer rules & design tokens
│   ├── index.html       # Google Fonts & SEO tags
│   └── tailwind.config.js
└── README.md            # Startup documentation
```

---

## Configuration & Environment Setup

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/estateai
JWT_SECRET=estateai_secure_token_secret_key_9948
JWT_EXPIRE=30d

# Google Gemini AI Config
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Storage Config (Optional - falls back to premium local mock links if missing)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## Quick Start Guide

### Prerequisite
Ensure MongoDB is running locally on port `27017` or update the `MONGODB_URI` environment variable in your config to point to a MongoDB Atlas cluster.

### 1. Boot up the Backend Server
Open a terminal in the root project:
```bash
# Navigate to backend and install
cd backend
npm install

# Run database seeder (clears DB and sets up Buyer, Seller, Agent, Admin and Properties)
npm run seed  # or: node seed.js

# Start the dev API server
node server.js
```
The server will run on `http://localhost:5000`.

### 2. Boot up the Frontend Client
Open a second terminal in the root project:
```bash
# Navigate to frontend and install
cd frontend
npm install

# Start Vite React server
npm run dev
```
The client will run on `http://localhost:5173`. Open it in your web browser.

---

## Verification Test Accounts

The seeder script pre-creates the following test accounts (password for all is `password123`):

1. **System Administrator**:
   - **Email**: `admin@estateai.com`
   - **Access**: View dashboard KPIs, verify agent RERA licenses, approve or review listings, ban accounts.
2. **Property Seller**:
   - **Email**: `priya@seller.com`
   - **Access**: Publish properties, run AI Description generators, approve client visit bookings, view AI market trend charts.
3. **Verified Real Estate Agent**:
   - **Email**: `vikram@agent.com`
   - **Access**: Manage listings assigned to agent, accept scheduled client appointments.
4. **Property Buyer**:
   - **Email**: `rahul@buyer.com`
   - **Access**: Conversational search with AI assistant, schedule property visits, save properties, add properties to comparison.


## ♿ Accessibility & Design Tokens
All UI components comply with WCAG 2.1 AA contrast ratios.
