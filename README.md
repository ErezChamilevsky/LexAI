# LexAI 🌍🤖

**LexAI** is an AI-powered language learning platform designed to help users master new languages through interactive chats, personalized tests, and progress tracking. Leverage the power of advanced LLMs to practice conversations, receive real-time corrections, and assess your proficiency level.

## 🚀 Features

- **Interactive AI Chat**: Practice conversations in your target language with an AI tutor (powered by Google Gemini).
- **Real-time Corrections**: Receive instant feedback on your grammar and vocabulary usage during chats.
- **Language Level Assessment**: Take tests to determine your current proficiency level (A1-C2).
- **Progress Tracking**: Monitor your learning journey via a comprehensive dashboard.
- **Multi-Language Support**: Learn and track progress in multiple languages simultaneously.
- **Secure Authentication**: easy sign-up and login with Google Authentication.



https://github.com/user-attachments/assets/2b7e228d-da17-4587-81e8-8f67d1758b9a



## 🛠️ Tech Stack

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
- **AI Integration**: [Google Generative AI](https://ai.google.dev/) (Gemini)
- **Authentication**: JWT & Google Auth Library
- **Testing**: [Jest](https://jestjs.io/) & Supertest

### Frontend
- **Framework**: [React](https://react.dev/) (powered by [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## 📂 Project Structure

```
LexAI/
├── backend/            # Express.js server & API
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   └── services/       # Business logic & external services
├── frontend/           # React application
│   ├── public/         # Static assets
│   └── src/            # Source code
│       ├── components/ # Reusable UI components
│       ├── pages/      # Application pages
│       └── ...
└── z_doc/              # Documentation & Design specs
```

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ErezChamilevsky/LexAI.git
    cd LexAI
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```

    *Create a `.env` file in the `backend` directory with the following variables:*
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GEMINI_API_KEY=your_gemini_api_key
    ```

    *Start the server:*
    ```bash
    npm start
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```

    *Start the development server:*
    ```bash
    npm run dev
    ```

4.  **Open the App:**
    Visit `http://localhost:5173` (or the port shown in your terminal) to start using LexAI.

## 🧪 Running Tests

To run the backend test suite:

```bash
cd backend
npm test
```
