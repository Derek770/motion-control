# Yashwant Sonkar - Interactive Developer & Game Portfolio

A modern, responsive portfolio and interactive arcade built with **Tailwind CSS**, **HTML5 Canvas**, and vanilla **JavaScript**, customized for **Yashwant Sonkar** (Full-Stack & AI Developer at Bennett University).

---

## 🌟 Highlights & Features

- **🎮 Playable Mini-Game ("Cyber Dodge: Neon Rush")**:
  - Full-featured 60FPS retro neon arcade game built on HTML5 Canvas.
  - Web Audio API synthesizer for retro sound effects (no audio asset files needed).
  - Hazard collision physics, glowing collectible energy cores (+75 pts), and particle explosion sparks.
  - Live Score & Persistent High Score saved in `localStorage`.
  - Multi-platform controls: Desktop (Arrow Keys / WASD / Mouse drag) and Mobile (On-screen touch buttons / Touch drag).
- **Interactive Particle Constellation Network**: Hardware-accelerated canvas background with cursor attraction/repulsion, glowing connection threads, click explosion bursts, and automatic theme adaptation.
- **Projects Showcase**: Filterable by *All*, *Full-Stack*, *AI & ML*, and *Games & Labs*:
  - **Spurt Local**: Hyper-local sports matchmaking app (Live on [spurt-local.vercel.app](https://spurt-local.vercel.app)).
  - **ComicVerse**: Digital comic e-commerce platform with Mongoose ODM & Clerk auth.
  - **CropSense**: Machine learning crop prediction model (Random Forest + agricultural dataset).
  - **Cyber Dodge**: Live playable mini-game right on the webpage.
- **Technical Skills Matrix**: Comprehensive coverage across Programming Languages, Frontend, Backend, Databases, AI/ML, and Developer Tools.
- **Education Timeline**: Bennett University, B.Tech in CSE (2023 – 2027), Greater Noida, UP.
- **Contact & Booking**: Direct contact channels (+91 7985088024, sonkaryashwant770@gmail.com, GitHub, LinkedIn) and functional message form.
- **Theme Switcher**: Smooth Dark/Light mode toggle respecting OS preferences.

---

## 📁 File Structure

```
portfolio/
├── index.html        # Main HTML5 structure with Arcade Arena & Portfolio sections
├── game.js           # Cyber Dodge 2D arcade game engine & Web Audio synthesizer
├── particles.js      # Interactive background particle constellation system
├── style.css         # Styling, glassmorphism, scrollbars, and badges
├── script.js         # Theme toggle, filter logic, contact form & modal
├── vercel.json       # Production deployment configuration for Vercel
└── README.md         # Documentation & deployment guide
```

---

## 🚀 How to Preview Locally

Run a local server:

```powershell
python -m http.server 3000
```

Then visit `http://localhost:3000` in any browser.

---

## 🐙 Push to Your GitHub

1. Create a new repository on your GitHub account ([github.com/new](https://github.com/new)) named `game-portfolio`.
2. In your terminal, run:

```powershell
cd C:\Users\PREDATOR\.gemini\antigravity\scratch\portfolio
git remote add origin https://github.com/Derek770/game-portfolio.git
git push -u origin main
```

---

## ⚡ Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account (`Derek770`) and select your `game-portfolio` repository.
3. Keep default settings (Framework: *Other*) and click **Deploy**.
4. Your site will be live instantly with automated SSL and global CDN!

### Option 2: Via Vercel CLI
Run in terminal:
```powershell
cd C:\Users\PREDATOR\.gemini\antigravity\scratch\portfolio
npx vercel
```
Follow the quick prompts to link and deploy to your Vercel account.
