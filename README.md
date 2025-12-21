# EvrLoot Discord Bot

A comprehensive Discord bot for the EvrLoot blockchain game that provides wallet management, NFT (Soul) information, tournament fighting, marketplace notifications, and mission reward tracking.

## Overview

This Discord bot serves as a bridge between the EvrLoot game ecosystem and Discord, enabling players to:

- Connect and verify their Moonbeam blockchain wallets
- View and share information about their Souls (NFTs)
- Participate in tournament battles
- Receive real-time notifications for mission rewards, marketplace trades, and bids
- Access daily game statistics and summaries
- Manage support tickets

## Features

### Wallet Management

- **Wallet Verification**: Connect and verify Moonbeam addresses with Discord accounts
- **Wallet Settings**: Manage wallet visibility (anonymous/public) and delete wallet connections
- **Connected Wallets**: View all wallets associated with your Discord account

### Soul (NFT) Information

- **Soul Info**: Display detailed information about Souls including attributes, images, and metadata
- **Claimable Souls**: Check for Souls available to claim
- **Soul Selection**: Interactive select menus for browsing Souls

### Tournament & Fighting System

- **Tournament Battles**: Participate in automated tournament battles
- **Fight Invitations**: Challenge other players to fights
- **Leaderboards**: View tournament rankings and personal standings
- **Fighter Management**: Add Souls to fight pools and view fighter details

### Real-Time Blockchain Event Monitoring

- **Mission Rewards**: Automatically posts notifications when Epic or Legendary items are earned from missions
- **Marketplace Trades**: Notifies when new trades are created on the marketplace
- **Bid Notifications**: Alerts for new bids and bid acceptances
- **Expedition Tracking**: Monitors expedition starts and tracks statistics

### Daily Operations

- **Daily Summaries**: Publishes daily game statistics at midnight
- **User Updates**: Automatically updates user information daily
- **Statistics Tracking**: Tracks mission rewards, expeditions, and other game metrics

### Support System

- **Discord Support Tickets**: Manages support tickets within Discord
- **In-Game Support**: Handles in-game support ticket system

## Commands

### Available Slash Commands

- `/connected-wallets` - View all wallets connected to your Discord account
- `/wallet-settings <address>` - Manage wallet settings (anonymity, deletion)
- `/soul-info <address>` - Display information about Souls owned by a wallet address
- `/tournament` - Tournament-related commands:
  - `battle` - Start a tournament battle
  - `leaderboard` - View tournament leaderboard
  - `personal-standings` - View your personal tournament standings
- `/update-username` - Update your Discord username in the system
- `/claimable-souls` - Check for Souls available to claim

## Technology Stack

- **Discord.js** (v14.13.0) - Discord bot framework
- **Web3.js** (v1.8.0) - Blockchain interaction
- **MongoDB** (v6.10.0) - Database for wallet verifications and user data
- **node-cron** (v3.0.2) - Scheduled tasks (daily summaries)
- **pagination.djs** (v4.0.12) - Pagination for Discord embeds

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (MongoDB Atlas or local instance)
- Discord Bot Token
- Moonbeam blockchain WebSocket provider
- Access to EvrLoot smart contracts

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with the following variables:

```
DISCORDJS_TOKEN=your_discord_bot_token
DISCORDJS_CLIENTID=your_discord_client_id
MONGODB_ACCESS=your_mongodb_connection_string
```

4. Configure smart contract addresses in `src/abi-interaction.js`

### Running the Bot

**Main Bot** (mission rewards, marketplace events, daily summaries):

```bash
npm start
```

**Verification Channel Handler**:

```bash
npm run discord-channel
```

**Discord Support Tickets**:

```bash
npm run start:support
```

**In-Game Support Tickets**:

```bash
npm run start:ingame-support
```

## Project Structure

```
src/
├── abi/                    # Smart contract ABIs
├── commands/               # Discord slash commands
│   ├── fight/             # Fighting system commands
│   ├── new-fight/         # Tournament battle system
│   └── select-menu/       # Select menu handlers
├── embeds/                # Discord embed builders
├── helpers/               # Utility functions
├── mappings/              # Game item/resource mappings
├── messaging/             # Message templates
├── summary/               # Daily summary generation
├── trades/                # Marketplace trade handlers
├── abi-interaction.js     # Smart contract interactions
├── config.js              # Bot configuration
├── discord-client.js      # Discord client setup
├── evrloot-api.js         # EvrLoot API integration
├── evrloot-db.js          # Database operations
├── index.js               # Main entry point
├── mission-interaction.js # Mission reward handling
├── setup-discord-bot.js   # Bot command registration
└── web3.js                 # Web3 provider setup
```

## Smart Contracts Monitored

- **Mission Contract**: Tracks mission rewards
- **Marketplace Contract**: Monitors trades, bids, and bid acceptances
- **Expedition Contract**: Tracks expedition starts
- **Souls Contract**: Retrieves Soul metadata and information
- **Resources Contract**: Handles resource rewards

## Configuration

Edit `src/config.js` to configure:

- Item rarity filters (Epic, Legendary)
- Tournament settings and allowed user IDs

## License

MIT License - see LICENSE file for details

## Author

summershades
