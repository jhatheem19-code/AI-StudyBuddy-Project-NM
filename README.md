# AI StudyBuddy — Full Stack Source

Full-stack educational AI application based on the AI StudyBuddy functional/backend baseline and the AI FitTrack interaction/layout reference.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas + Mongoose
- Auth: JWT + bcryptjs
- AI: Google Gemini
- Search: MongoDB Atlas Search + Atlas Vector Search
- RAG: Gemini embeddings + vector retrieval + grounded Study Assistant

## Included Features
### Student
- Register / Login
- Demo Student login button
- Student Dashboard
- Study Material CRUD
- TXT / MD / PDF upload
- AI Summary
- AI Flashcards
- AI Quiz
- AI Study Plan
- Atlas keyword search
- Atlas semantic/vector search
- Gemini Study Assistant chatbot with RAG/context retrieval

### Admin
- Demo Admin login button
- Admin Dashboard
- User management
- Study material monitoring
- Reports / Analytics
- System Health

## Demo Credentials
Run the seed script first:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run seed:demo
npm run dev
```

Student:
- Email: `student@studybuddy.demo`
- Password: `Student@123`

Admin:
- Email: `admin@studybuddy.demo`
- Password: `Admin@123`

The Demo Student and Demo Admin buttons use the real `/api/auth/login` endpoint and receive a real JWT.

## Frontend
```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`).

## MongoDB Atlas
1. Create an Atlas cluster.
2. Create a database user and Network Access rule.
3. Put the Atlas connection string in `backend/.env`.
4. Create the two indexes from:
   - `backend/atlas-indexes/material-search-index.json`
   - `backend/atlas-indexes/material-vector-index.json`
5. Wait until both indexes are ACTIVE.

Search index name: `study_material_search`
Vector index name: `study_material_vector`

## Gemini
Put your key in `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

## Main API
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/materials`
- `POST /api/materials`
- `GET /api/materials/:id`
- `PUT /api/materials/:id`
- `DELETE /api/materials/:id`
- `POST /api/materials/:id/summarize`
- `POST /api/ai/flashcards`
- `POST /api/ai/quiz`
- `POST /api/ai/study-plan`
- `GET /api/search?q=...`
- `POST /api/search/semantic`
- `POST /api/assistant/chat`
- `GET /api/assistant/sessions`
- `GET /api/student/dashboard`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/toggle-active`
- `GET /api/admin/materials`
- `GET /api/admin/reports`
- `GET /api/admin/system-health`

## Important
Real secrets are intentionally NOT included. Use `.env.example`.

The Atlas Search and Vector Search features require actual Atlas indexes. They are not marked as working merely by documentation; the project includes real source and index definitions, but final runtime verification still requires your own MongoDB Atlas cluster + Gemini API key.
