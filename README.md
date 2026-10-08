# AeroTerrene ✈️🌍

> **A 100% free, privacy-first travel logger featuring an interactive 3D globe with animated flight paths, detailed 2D map views, digital passport stamps, and personal travel analytics.**

---

## 💡 Why did I build this?

> *"Flightly paise maang raha tha yaar :("*

Most travel logging apps (like Flightly or App in the Air) charge expensive monthly subscriptions or lock basic features like flight path rendering and map logs behind paywalls just to let you record your own journeys. **AeroTerrene was built to fix that.**

AeroTerrene is **100% free and open-source**, giving you full access to rich travel tracking tools without subscription fees, ads, or locked features.

Made with ❤️ by Moin.

---

## ✨ Key Features

- 🌐 **Interactive 3D Globe**: Render your entire journey history across the world on an interactive 3D globe with animated flight arcs, customizable rotation, camera controls, and interactive airport waypoints.
- 🗺️ **Detailed 2D Travel Map**: Switch seamlessly to high-performance 2D maps powered by Leaflet to explore precise itineraries, flight segments, and road trips.
- 🛫 **Comprehensive Trip Logger**: Easily log flights, road trips, and travel memories with multi-stop routes, auto-geocoding, transit mode selection, and trip notes.
- 🛂 **Digital Passport & Stamps**: Collect auto-generated digital passport stamps for every country you visit and track your travel milestones.
- 📊 **Travel Analytics**: Gain insights into total distance traveled, top visited countries, transport preferences, and yearly logs.
- 🌙 **Dark & Light Modes**: Beautiful, modern UI engineered for crisp viewing in both light and dark themes.

---

## 🛠️ Tech Stack

- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **3D & Maps**: Three.js (3D Globe & Flight Arcs), Leaflet & Carto (2D Maps)
- **Icons & Animation**: Lucide Icons, Framer Motion, Anime.js
- **Backend & Auth**: Firebase (Authentication & Cloud Firestore)
- **AI Integration**: Google Gemini API (`@google/genai`)

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `bun`

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/Moinuddin9777/aeroterrene.git

# Navigate into project directory
cd aeroterrene

# Install dependencies
npm install
```

### 3. Environment Variables Configuration

Copy the example environment file to create `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and fill in your keys:

```env
# Firebase Credentials (Required for Auth & Cloud Firestore sync)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_FIRESTORE_DATABASE_ID=(default)

# Map Tile API Key (Optional: for Carto custom basemaps)
VITE_CARTO_API_KEY=your_carto_api_key

# Google Gemini API Key (For AI travel summary features)
GEMINI_API_KEY=your_gemini_api_key
```

> **Note**: For local offline testing without Firebase, demo mock data can be loaded directly from the UI.

### 4. Run Development Server

Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start logging your journeys!

### 5. Build for Production

To create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🤝 Contributing

Contributions are welcome! Please check out the [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on how to set up your environment, report issues, and submit pull requests.

---

## 📄 License

Distributed under the **MIT License**. Free to use, modify, and distribute.