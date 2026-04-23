# FRVStream Frontend

Vite + React SPA for FRVStream. The app consumes the FRVStream API (`config/config.json::ApiURL`) and synchronises auth with the main FRVTubers site via NextAuth.

## Auth flow
- When a user has an active NextAuth session on `https://frvtubers.example.com` (or `http://localhost:3000` in dev), the frontend calls `POST /api/v1/auth/sync` with `credentials: 'include'` to send the NextAuth cookies to FRVStream.
- `/api/v1/auth/sync` validates the session using `FRVTUBERS_AUTH_ORIGIN` (defaults to `https://frvtubers.example.com`), creates/associates a local user, and returns the synced profile including roles/VTuber flags. The UI uses that payload via `LoginContext`.
- If the sync endpoint returns 401, the app redirects to the main site’s Discord/NextAuth login (`/api/auth/signin/discord`) with the current page as callback.
- Ensure FRVStream runs on the same domain or a compatible subdomain so NextAuth cookies are shared; otherwise the sync will fail and always redirect.

## Development
- Install deps: `npm install`
- Run dev server: `npm run dev` (served at the port shown by Vite)
- Env:
  - `VITE_API_URL` (ex: `https://api-frvstream.frvtubers.com/`) to override `config/config.json::ApiURL`
  - `VITE_FRVTUBERS_AUTH_ORIGIN` to override the default auth origin.

## Fonctionnalités côté client
- Favoris : ajoute/supprime des VTubers via le menu latéral ou les cartes et retrouve-les sur `/favorites` (section live + hors ligne). Requiert une session NextAuth FRVTubers.
- Favoris enrichis : `/api/v1/streamers/favorites/streams` (credentials `include`) fournit l’état live sans recharger toute la liste; utilisé sur `/favorites` pour distinguer live/hors-ligne via `vtuber.twitchId` et `streams[].user_login`.
- Tendances 24h : `/api/v1/streamers/trends` est consommé sur la page d’accueil pour afficher les VTubers les plus consultés sur les dernières 24h.
- Tracking de clics : ouverture d’un stream (`/c/:streamerName`) enregistre un clic via `/streamers/clicks` pour nourrir les tendances.
