# Akatsuki's Draft – AI-Enabled Content Sharing Platform (Backend)
Nodevember 4.0 · Node.js, Express, MongoDB (Mongoose), JWT, Google Gemini

## Setup
```bash
npm install
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, ADMIN_SECRET
npm run dev
```
Get a free Gemini key at https://aistudio.google.com/apikey

## Folder structure
```
config/      db + gemini client
controller/  request handlers
middleware/  auth (JWT, admin) + error handling
model/       User, Post schemas
routes/      auth, posts, admin, ai
services/    Gemini integration
utils/       helpers (token, asyncHandler, ApiError)
index.js     app entry (also exported for Vercel)
```

## Schemas
- **User**: `{ name, email, password, role: "admin" | "user" }`
- **Post**: `{ title, description, content, image, category, createdBy (ref User), status: draft|pending|approved|rejected, createdAt }`
  (+ `improvedFrom` links an AI-improved draft to its original)

## API
All routes except register/login need `Authorization: Bearer <token>`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | public | Register (admin needs `role:"admin"` + `adminKey`) |
| POST | /auth/login | public | Login, returns JWT |
| GET | /auth/me | user | Current user |
| POST | /posts | user | Create post (`status`: `draft` default or `pending`) |
| GET | /posts | user | All approved posts (`?category=&search=`) |
| GET | /posts/my-posts | user | Own posts & drafts (`?status=`) |
| GET | /posts/:id | user | Approved post by ID |
| PATCH | /posts/:id | owner | Update own post (set `status:"pending"` to submit) |
| DELETE | /posts/:id | owner | Delete own post |
| GET | /admin/posts/pending | admin | Pending posts |
| PATCH | /admin/posts/approve/:id | admin | Approve |
| PATCH | /admin/posts/reject/:id | admin | Reject |
| POST | /ai/improve/:postId | owner | Gemini-improve → saved as **new draft**, original kept |

### Example
```bash
curl -X POST localhost:5000/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Itachi","email":"itachi@akatsuki.com","password":"123456"}'

curl -X POST localhost:5000/posts -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"my frist post","status":"draft"}'

curl -X POST localhost:5000/ai/improve/<postId> -H "Authorization: Bearer $TOKEN"
```

## Deploy on Vercel
Push to GitHub, import in Vercel, add the env vars from `.env.example`. `vercel.json` is already configured.
