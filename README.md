# Virtuoso — Virtual Piano

A browser-based virtual piano built with React and Vite. Play notes via keyboard or mouse, listen to built-in songs, or use Guide Mode to learn them step by step.

## Features

- **Free Play** — click keys or use your keyboard to play notes
- **Auto-Play** — listen to a song played automatically
- **Guide Mode** — follow along note-by-note; the next key is highlighted as you progress
- **Volume control** — slider with mute toggle
- **5 built-in songs** — Ode to Joy, Twinkle Twinkle, Happy Birthday, Für Elise, Jingle Bells

## Keyboard Mapping

| White keys | `A` `S` `D` `F` `G` `H` `J` `K` `L` |
|------------|---------------------------------------|
| Black keys | `W` `E` `T` `Y` `U` `O` `P`          |

## Tech Stack

- React 19, Vite 8
- Tone.js (audio synthesis)
- Tailwind CSS v4
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
