# AeroTerrene ✈️🌍

> **A 100% free, privacy-first travel logger featuring an interactive 3D globe with animated flight paths, detailed map views, passport stamps, and personal travel analytics.**

---

### Why AeroTerrene?

Most travel logging apps on the market charge expensive monthly subscriptions or hide basic features behind paywalls just to let you log your trips. **AeroTerrene was built to change that.** 

It is completely **free** and open-source, giving you full access to rich travel tracking tools without subscription fees or locked features.

---

## Key Features

- 🌐 **Interactive 3D Globe**: Visualize all your journeys around the world on an interactive 3D globe rendered with real-time flight paths, arc animations, and waypoint markers.
- 🗺️ **Interactive Travel Map**: Switch to detailed map views powered by Leaflet to explore specific routes, stops, and location data.
- 🛫 **Smart Trip Logger**: Log flights, road trips, and journeys with automated coordinate geocoding, multi-stop itineraries, travel modes, and memory journaling.
- 🛂 **Digital Passport & Stamps**: Track visited countries, collect digital passport stamps, and showcase your travel milestones.
- 📊 **Travel Analytics**: View insights into total distance covered, countries visited, favorite transit modes, and travel habits.
- 🌙 **Dark & Light Mode**: Sleek, modern design optimized for both day and night viewing.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Visualization**: Three.js (3D Globe & Arcs), Leaflet (2D Maps), Lucide Icons, Framer Motion
- **Backend & Storage**: Firebase Authentication, Cloud Firestore
- **AI Integration**: Google GenAI / Gemini API

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `bun`

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Moinuddin9777/aeroterrene.git
   cd aeroterrene
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to view the application.

---

## License

Distributed under the MIT License. Feel free to use, modify, and contribute!

## Why did I build this?

Flightly paise maang raha tha yaar :(

Made with love using Google AI Studio by Moin ❤️