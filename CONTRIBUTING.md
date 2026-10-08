# Contributing to AeroTerrene ✈️🌍

Thank you for your interest in contributing to **AeroTerrene**! We welcome contributions from developers of all skill levels. Whether you are fixing bugs, improving documentation, adding new features, or enhancing map rendering, your help is appreciated.

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- **Git**

### Local Setup

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aeroterrene.git
   cd aeroterrene
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Setup Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Firebase and optional Carto API keys to `.env.local`.

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the application in your browser.

---

## 🛠️ Development Workflow

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**:
   - Write clean, documented, and maintainable TypeScript code.
   - Maintain the existing design system and dark/light theme compatibility.
   - Ensure interactive components (3D Globe, Leaflet Map) remain responsive.

3. **Verify Code Quality**:
   Run TypeScript linting and build checks before committing:
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit your changes**:
   Follow conventional commit messages:
   - `feat: add 3D globe animation controls`
   - `fix: resolve leaflet tile rendering glitch on dark mode`
   - `docs: update setup guide in README`

5. **Push and Open a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```
   Open a Pull Request on the main repository with a clear title and description of your changes.

---

## 🎨 Code Style & Guidelines

- **TypeScript**: Use strict typing. Avoid `any` where possible.
- **Components**: Keep components modular in `src/components/`.
- **Styling**: Use Tailwind CSS and ensure both Light and Dark mode look great.
- **Secrets**: Never commit real API keys, tokens, or credentials into the codebase.

---

## 🤝 Code of Conduct

Please be respectful and welcoming to all community members. We aim to foster an open, collaborative environment.

Thank you for helping make AeroTerrene better for everyone! Happy coding! 🚀
