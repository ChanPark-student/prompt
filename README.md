# Prompt Sharing Platform

## Tech Stack

-   **Frontend**: Next.js, React, TypeScript, Tailwind CSS
-   **Backend**: FastAPI, Python, SQLAlchemy
-   **Database**: PostgreSQL, SQLite
-   **Deployment**: Docker, Supervisor

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### Frontend

```bash
npm install
npm run dev
```

## Environment Variables

```bash
cp .env.example .env
```

## Deployment

```bash
docker build -t prompt-app .
docker run --env-file ./.env -p 3000:3000 -p 8000:8000 prompt-app
```

## API Documentation

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
