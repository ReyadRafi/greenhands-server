# GreenHands — Server

Express + MongoDB backend for the GreenHands community events platform.

## Tech Stack
- Node.js + Express
- MongoDB with Mongoose
- Firebase Admin SDK (JWT verification)

## Main Routes
- `GET /events` — public upcoming events (supports `?type=` and `?search=`), or `?email=` for a user's own events (requires auth)
- `GET /events/:id` — single event details
- `POST /events` — create an event (requires auth)
- `PUT /events/:id` — update an event (requires auth + ownership)
- `DELETE /events/:id` — delete an event (requires auth + ownership)
- `POST /joined-events` — join an event (requires auth)
- `GET /joined-events?email=` — a user's joined events (requires auth)
- `GET /joined-events/check?eventId=&email=` — check join status (requires auth)

## Client Repository
https://github.com/ReyadRafi/greenhands-client