# Neueda Backend

This is the backend for a financial chatbot and stock trading application. It provides RESTful APIs for user authentication, wallet management, stock trading, holdings, and integrates with Google Gemini and Finnhub APIs for AI chat and real-time stock data.

## Features

- **User Authentication**: Register, login, logout with JWT and hashed passwords.
- **Wallet Management**: Add and get wallet cash for users.
- **Stock Trading**: Buy and sell stocks, update holdings.
- **Holdings & Stocks**: View holdings, get all stocks, fetch real-time prices and metrics.
- **AI Chatbot**: Financial query chatbot powered by Google Gemini API.
- **Stock News & Logos**: Fetch latest news and logos for stocks using Finnhub API.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MySQL database
- Finnhub API key (optional, demo key included)
- Google Gemini API key

### Installation

1. Clone the repository:

   ```
   git clone <repo-url>
   cd final backend/neueda-backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Configure environment variables:

   - Copy `.env` and update with your credentials:

     ```
     GEMINI_API_KEY=your_gemini_api_key
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_db_password
     DB_NAME=neueda
     ```

4. Set up MySQL database:

   - Create a database named `neueda`.
   - Create required tables: `user`, `holdings`, `stocks`.

### Running the Server

Start the backend server:

```
npm run dev
```

Server runs at [http://localhost:3002](http://localhost:3002).

### API Endpoints

All endpoints are prefixed with `/api`.

#### Auth

- `POST /api/register` — Register a new user
- `POST /api/login` — Login
- `POST /api/logout` — Logout

#### Wallet

- `POST /api/addCash` — Add cash to wallet
- `POST /api/getWalletCash` — Get wallet cash

#### Trading

- `POST /api/buy` — Buy stocks
- `POST /api/sell` — Sell stocks

#### Holdings & Stocks

- `GET /api/holdings/:user_id` — Get holdings for user
- `GET /api/getAllHoldings` — Get all holdings
- `GET /api/getAllStocks` — Get all stocks with real-time data
- `POST /api/updateHoldings` — Update holdings

#### News & Logos

- `GET /api/stockNews/:user_id` — Get news for user's stocks
- `GET /api/allStockLogos` — Get all stock logos
- `GET /api/getAllStockBuy` — Get stocks for buying

#### Chatbot

- `POST /api/chat` — AI chatbot for financial queries

### Testing

Run unit tests:

```
npm test
```

## Project Structure

```
neueda-backend/
├── app.js
├── package.json
├── .env
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── chatbot.js
│   │   ├── index.js
│   │   ├── stocks.js
│   │   ├── trade.js
│   │   └── user.js
│   └── routes/
│       └── index.js
├── test/
│   └── controllers/
│       ├── auth.test.js
│       └── user.test.js
└── .gitignore
```

## Notes

- Ensure your MySQL server is running and accessible.
- Finnhub API key is hardcoded for demo; replace with your own for production.
- Gemini API key must be set in `.env` for chatbot functionality.

## License

ISC
