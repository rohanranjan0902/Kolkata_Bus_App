# Kolkata Bus Platform

## Run locally with Docker

Install Docker Desktop (or Docker Engine with the Compose plugin), then run from the repository root:

```bash
docker compose up --build
```

Docker starts PostgreSQL, Redis, the NestJS API, and the Next.js admin app. The API applies database migrations on startup.

- Admin app: <http://localhost:3001>
- API: <http://localhost:3000>

The demo database starts empty. To load the demo users, buses, routes, and trips, run:

```bash
docker compose exec api npm run seed --workspace=api
```

The seed script clears existing records before loading demo data. For demo sign-in, use `admin@busly.com` / `admin123`.

The admin map needs a Mapbox token. Set `NEXT_PUBLIC_MAPBOX_TOKEN` in your shell before starting Compose, or add it to a local `.env` file:

```dotenv
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

Stop the services with `Ctrl+C`, or run `docker compose down` in another terminal. Database data is kept in a named volume. To delete that data as well, run `docker compose down --volumes`.

The Docker setup is intended for local development; its default database credentials and JWT secrets are not suitable for deployment.

## Mobile apps

The driver and passenger apps are Expo clients and are not included in the Docker services. With the API running, install the project dependencies and start either app:

```bash
npm install
npm run start --workspace=driver
# or
npm run start --workspace=passenger
```

Use Expo Go or an emulator to open the app. The clients connect to the API on port `3000`.
