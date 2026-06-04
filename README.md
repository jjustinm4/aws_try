# AWS Learning Image App

Minimal React + FastAPI application that runs locally with Docker Compose and is structured for future AWS deployment work.

## Architecture Diagram

```text
Browser
  |
  | http://localhost:5173
  v
React + Vite frontend
  |
  | Axios calls VITE_API_BASE_URL
  v
FastAPI backend http://localhost:8000
  |                         |
  | SQLAlchemy ORM          | LOCAL FILE STORAGE -> AWS S3
  v                         v
PostgreSQL container        backend/uploads/latest-image.jpg
postgres:5432

LOCAL POSTGRES -> AWS RDS PostgreSQL
LOCAL DOCKER IMAGE -> AWS ECR
LOCAL MACHINE -> AWS EC2
```

## Local Setup

Requirements:

- Docker
- Docker Compose

Start the application:

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs

## API Documentation

### POST `/upload`

Accepts a multipart image upload.

Form field:

- `file`: image file

Behavior:

- Stores the uploaded image at `backend/uploads/latest-image.jpg`
- Overwrites any previous image
- Updates `image_status.image_uploaded` to `true`

Response:

```json
{
  "image_uploaded": true
}
```

### GET `/status`

Returns the current image status.

Response:

```json
{
  "image_uploaded": false
}
```

### GET `/image`

Returns `latest-image.jpg` when an image exists and `image_uploaded` is `true`.

### DELETE `/image`

Deletes `latest-image.jpg` and updates `image_status.image_uploaded` to `false`.

Response:

```json
{
  "image_uploaded": false
}
```

## Docker Explanation

`docker-compose.yml` starts three services:

- `frontend`: React + Vite development server on port `5173`
- `backend`: FastAPI service on port `8000`
- `postgres`: PostgreSQL database on port `5432`

The backend waits for PostgreSQL to become healthy before starting. On startup, FastAPI creates the `image_status` table and inserts the initial record:

```sql
id = 1
image_uploaded = false
```

The uploads directory is mounted from `./backend/uploads` to `/app/uploads` so local image storage persists while containers are rebuilt.

## Future AWS Migration Plan

- LOCAL FILE STORAGE -> AWS S3
- LOCAL POSTGRES -> AWS RDS PostgreSQL
- LOCAL DOCKER IMAGE -> AWS ECR
- LOCAL MACHINE -> AWS EC2
- FastAPI routes can later be split behind API Gateway
- Image processing or cleanup jobs can later move to Lambda
- `.github/workflows/deploy.yml` can later authenticate with AWS, push images to ECR, and deploy to EC2
