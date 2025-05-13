# 🧠 Mini CRM Backend

A lightweight backend for a Customer Relationship Management (CRM) platform, built using **Node.js**, **Express**, **MongoDB**, and **Redis**. It supports authentication via JWT, Google OAuth (optional), and also integrates with OpenAI and Google's Gemini API for future AI-enhancements.

---

## 🚀 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Google OAuth
- **AI Services**: OpenAI, Google Gemini API
- **Caching**: Redis
- **Validation**: express-validator
- **Testing**: Jest
- **Docs**: Swagger

---

## 📦 Project Structure

mini-crm-backend/
│
├── src/
│ ├── app.js # Entry point
│ ├── index.js # Server setup
│ ├── routes/ # API routes
│ ├── controllers/ # Logic layer
│ ├── models/ # Mongoose models
│ ├── middlewares/ # Custom middlewares (auth, error, etc.)
│ ├── utils/ # Helper functions
│ └── config/ # MongoDB, Redis, etc.
│
├── seed/ # Seed script
├── .env # Environment variables
├── package.json # Project dependencies
└── README.md 

---

## ⚙️ Environment Variables (`.env`)

You need a `.env` file in your root directory with the following configuration:

```env
PORT=4713
NODE_ENV=development

# MongoDB
MONGODB_URI="your_mongodb_uri"

# JWT
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_token_secret"
JWT_EXPIRES_IN=4h

# AI APIs
GEMINI_API_KEY="your_google_gemini_api_key"
OPENAI_API_KEY="your_openai_api_key"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```
# Clone the repository
git clone https://github.com/yourusername/mini-crm-backend.git
cd mini-crm-backend

# Install dependencies
npm install

# For development
npm run dev

# For production (after setting NODE_ENV=production)
npm start

# For Seeding
node script/seed.js

