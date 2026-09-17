# GitFolio 🐙

A sleek GitHub profile & repository explorer built with React, Vite, and the GitHub REST API. Search any GitHub username to view their profile stats and browse their public repositories.

## Features

- 🔍 **User search** — look up any GitHub username via the GitHub public API
- 👤 **Profile overview** — avatar, bio, company, location, blog/Twitter links, join date
- 📊 **Stats at a glance** — public repos, followers, following, gists, and total stars across all repos
- 📁 **Repository browser** — name, description, primary language, stars, forks, and last-updated time
- 🔎 **Filter & sort repos** — by recently updated, most stars, most forks, or name
- 🕘 **Search history** — quick-access chips for recently searched usernames (saved locally)
- 🌗 **Dark / light theme toggle** — preference saved across sessions
- ⚠️ **Proper error handling** — clear messages for "user not found" and API rate limits

## Tech Stack

- [React](https://react.dev/) 19
- [Vite](https://vitejs.dev/) — dev server & build tool
- [Axios](https://axios-http.com/) — HTTP client for the GitHub API
- [React Bootstrap](https://react-bootstrap.netlify.app/) — base UI components
- Custom CSS theming (no external design framework overrides)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```bash
git clone <your-repo-url>
cd git_api
npm install
```

### Run in development

```bash
npm run dev
```

App will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── componant/
│   └── home.jsx       # Main search + profile + repo browser UI
├── App.jsx            # Root component
├── App.css            # Theming & layout styles
├── index.css           # Base/global styles
└── main.jsx            # App entry point
```

## API Reference

Uses the public [GitHub REST API](https://docs.github.com/en/rest) (unauthenticated):

- `GET https://api.github.com/users/{username}` — user profile
- `GET {user.repos_url}` — user's public repositories

> Note: Unauthenticated requests are rate-limited by GitHub (60 requests/hour per IP).

## License

This project is open source and available for personal or educational use.
