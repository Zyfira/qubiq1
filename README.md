# Qubiq — Deployable MVP

A role-based quiz and assessment platform built with React + Vite, Spring Boot, and PostgreSQL.

## Included
- Student, teacher, and admin roles
- Registration and login with BCrypt password hashing and JWT authentication
- Email-domain agnostic registration (no `@sjcit.ac.in` restriction)
- Teacher accounts require admin approval before teacher-only features are available (pending teachers cannot sign in)
- Teacher-owned quiz creation and management
- Student quiz attempts and scoring
- Teacher analytics scoped to quizzes they own; admin can view platform-wide summary
- PDF upload endpoint and text extraction using Apache PDFBox (question drafting is a basic extract-and-preview workflow, not an AI-generated question service)
- Dockerfiles and Render Blueprint for deployment
- PostgreSQL configuration via environment variables

## Important MVP notes
- Email verification delivery is not implemented in this starter. Registration accepts any syntactically valid email. Add an SMTP provider and verification-token flow before using this with real users.
- The first admin is created using the bootstrap environment variables `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`. Set them in the backend environment before first startup. If unset, no public admin signup exists.
- The PDF endpoint extracts text and returns a preview. It does not call an external LLM or generate production-quality questions.
- This is a deployable foundation, not a security audit. Configure HTTPS, secrets, backups, rate limits, and production email verification before public launch.

## Local development

### Requirements
- Java 17+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+ (or Docker)

### Backend
Create a PostgreSQL database named `qubiq`, then:

```bash
cd backend
# Windows PowerShell:
$env:DB_URL="jdbc:postgresql://localhost:5432/qubiq"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="replace-with-a-long-random-secret-at-least-32-bytes"
$env:BOOTSTRAP_ADMIN_EMAIL="admin@example.com"
$env:BOOTSTRAP_ADMIN_PASSWORD="ChangeMe123!"
mvn spring-boot:run
```

Backend: `http://localhost:8080`

### Frontend
In another terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Deploy

### Database — Neon
1. Create a PostgreSQL project in Neon.
2. Copy the connection details.
3. Set backend `DB_URL` to a JDBC URL, for example:
   `jdbc:postgresql://HOST/DB?sslmode=require`
4. Set `DB_USERNAME` and `DB_PASSWORD`.

### Backend — Render
1. Push this repository to GitHub.
2. In Render, create a Blueprint and select the repository.
3. Render reads `render.yaml`. Set the secret values prompted by Render:
   - `JWT_SECRET` (at least 32 random characters)
   - `BOOTSTRAP_ADMIN_EMAIL`
   - `BOOTSTRAP_ADMIN_PASSWORD`
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (use your Neon database)
4. The backend service uses the `backend/Dockerfile`.

### Frontend — Vercel
1. Import the GitHub repository into Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Set `VITE_API_URL` to your deployed backend URL, e.g. `https://your-api.onrender.com/api`.
7. Deploy.

Update the backend `APP_CORS_ALLOWED_ORIGINS` environment variable to your Vercel domain, e.g. `https://your-qubiq.vercel.app`.

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/quizzes`
- `POST /api/quizzes` (teacher/admin)
- `GET /api/quizzes/{id}`
- `POST /api/quizzes/{id}/attempts` (student)
- `GET /api/analytics/overview` (teacher/admin)
- `POST /api/documents/preview` (teacher/admin, multipart `file`)
- `GET /api/admin/pending-teachers` (admin)
- `PATCH /api/admin/teachers/{id}/approve` (admin)

## Default quiz payload
```json
{
  "title": "Data Structures Basics",
  "description": "Arrays, stacks and queues",
  "questions": [
    {
      "prompt": "Which data structure follows FIFO?",
      "options": ["Stack", "Queue", "Tree", "Graph"],
      "correctOption": 1,
      "marks": 1
    }
  ]
}
```
`correctOption` is zero-based. The API omits answer keys from quiz responses; scoring is performed server-side.
