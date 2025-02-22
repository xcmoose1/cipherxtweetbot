# CipherX Twitter Bot Dashboard

A Next.js-based dashboard for managing automated tweets for CipherX using market and sentiment data from LunarCrush and GeckoTerminal.

## Features

- 🛠 **Tweet Settings Panel** → Select data types to tweet about (Market Trends, Memecoins, DeFi, Sentiment)
- ⏳ **Tweet Frequency Control** → Choose posting frequency (1-5 tweets per day)
- 👀 **Tweet Preview** → See generated tweets before they are posted
- 🚀 **Pause/Resume Button** → Toggle automatic posting on/off
- 📊 **API Status Indicator** → Monitor API rate limits and status

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- DaisyUI
- React Query

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API keys:
   ```
   TWITTER_API_KEY=your_twitter_api_key
   LUNARCRUSH_API_KEY=your_lunarcrush_api_key
   GECKOTERM_API_KEY=your_geckoterm_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

- **LunarCrush** `/public/coins/list/v2` - Market data and social sentiment
- **GeckoTerminal** `/onchain/networks/trending_pools` - DEX pool data
- **Twitter API** - For posting tweets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
