# Phantom v2 Wallet Web

A modern web-based Solana wallet application inspired by Phantom wallet v2.

## Features

- 🔐 **Wallet Management**: Create new wallets or import existing wallets using private keys
- 💰 **Balance Display**: View your SOL balance in real-time
- 📤 **Send Transactions**: Send SOL to any Solana address
- 📥 **Receive SOL**: Display your wallet address for receiving funds
- 📜 **Transaction History**: View your transaction history with links to Solscan
- 🎨 **Modern UI**: Beautiful, responsive design with Phantom-inspired purple theme

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a New Wallet

1. Click "Create New Wallet"
2. Save your private key securely (you'll need it to access your wallet)
3. Your wallet will be automatically connected

### Importing an Existing Wallet

1. Click "Import from Private Key"
2. Enter your private key
3. Your wallet will be connected

### Connecting to Existing Wallet

If you've previously created a wallet in this browser, click "Connect Existing Wallet" to automatically reconnect.

### Sending SOL

1. Click the "Send" button
2. Enter the recipient's Solana address
3. Enter the amount of SOL to send
4. Confirm the transaction

### Receiving SOL

1. Click the "Receive" button
2. Copy your wallet address
3. Share it with the sender

## Security Notes

⚠️ **Important**: This is a web-based wallet for demonstration purposes. For production use:

- Never share your private key with anyone
- Store private keys securely offline
- Consider using hardware wallets for large amounts
- Always verify transaction details before confirming

## Technology Stack

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **@solana/web3.js**: Solana blockchain interaction
- **tweetnacl**: Cryptographic functions

## License

MIT

