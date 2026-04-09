# Judgement

A multiplayer trick-taking card game built with Next.js, Socket.io, and Tailwind CSS.

## Rules

- Each round, players are dealt cards from a fixed pool (highest-ranked cards only).
- Players bid how many tricks they think they'll win.
- The last bidder cannot make the total bids equal the number of tricks available.
- Players must follow the lead suit if they can; otherwise, they may play any card.
- Trump beats all other suits. The trump suit follows a fixed cycle per round: **Spades → Hearts → Diamonds → Clubs → No Trump**, then repeats.
- **Scoring:** If you win exactly the number of tricks you bid, you get **10 + bid** points. Otherwise, you get **0** points.
- The game starts with the chosen number of cards per player, decreases to 1, then increases back. The player with the highest total score at the end wins.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)
- [ngrok](https://ngrok.com/) (for sharing over the internet)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development mode

```bash
npm run dev
```

The game will be available at **http://localhost:3000**.

### 3. Run in production mode

```bash
npm run build
npm start
```

## How to Play

1. Open the game in your browser at `http://localhost:3000`.
2. Enter your name and click **Create Room**.
3. Share the 6-character **Room Code** with your friends.
4. Other players open the same URL, enter their name, type in the room code, and click **Join Room**.
5. Once everyone has joined (minimum 2 players), choose how many starting cards you want and click **Start Game**.
6. Bid, play tricks, and try to hit your bid each round!

## Hosting with ngrok

ngrok creates a public URL that tunnels to your local machine, so friends on other networks can join.

### 1. Install ngrok

```bash
# macOS (Homebrew)
brew install ngrok

# Linux (snap)
sudo snap install ngrok

# Or download from https://ngrok.com/download
```

### 2. Sign up and authenticate

Create a free account at [ngrok.com](https://ngrok.com/), then:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 3. Start the game server

```bash
npm run dev
```

### 4. Start ngrok in a separate terminal

```bash
ngrok http 3000
```

ngrok will display a public URL like:

```
Forwarding  https://abcd-1234.ngrok-free.app -> http://localhost:3000
```

### 5. Share the URL

Send the `https://....ngrok-free.app` URL to your friends. They open it in their browser, enter their name, and join using the room code.

> **Note:** The free ngrok plan shows an interstitial page on first visit. Players just need to click "Visit Site" to proceed.

## Project Structure

```
src/
├── app/                  # Next.js pages
│   ├── page.tsx          # Home screen (create/join room)
│   ├── layout.tsx        # Root layout and theme
│   └── game/[roomId]/    # Game page (dynamic route per room)
├── components/           # React components
│   ├── Card.tsx          # Playing card
│   ├── Hand.tsx          # Player's hand
│   ├── TrickArea.tsx     # Cards played in current trick
│   ├── ScoreBoard.tsx    # Score table
│   ├── BidSelector.tsx   # Bid selection UI
│   └── GameMenu.tsx      # In-game menu (new game, exit)
├── game/                 # Pure game logic
│   ├── state.ts          # Game state transitions
│   ├── deck.ts           # Deck building, shuffling, dealing
│   ├── tricks.ts         # Trick validation and resolution
│   ├── bidding.ts        # Bid validation
│   └── scoring.ts        # Score calculation
├── hooks/                # React hooks
│   ├── useGameState.ts   # Game state + socket events
│   ├── useSocket.ts      # Socket.io client singleton
│   └── useSound.ts       # Web Audio API sound effects
├── server/               # Server-side code
│   ├── socket.ts         # Socket event handlers
│   └── roomManager.ts    # Room and player management
└── shared/
    └── types.ts          # Shared TypeScript types
```

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Node.js, Socket.io
- **Sound:** Web Audio API (no audio files)
- **Language:** TypeScript
