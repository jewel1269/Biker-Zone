# Corporate News Publisher (Full Stack)

Professional news publishing workflow with:

- React + Vite frontend
- Express + MongoDB backend
- Multer multipart file handling
- Cloudinary image storage (cover + gallery)

## Project structure

```bash
.
├── client
│   └── src
│       └── components/CorporateNewsPublisher.jsx
└── server
    └── src
        ├── controllers/newsController.js
        ├── middlewares/uploadNewsImages.js
        ├── models/news.js
        └── routes/newsRoutes.js
```

## 1) Install

From project root:

```bash
npm run install:all
```

Or install packages manually:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

## 2) Configure environment

Create `.env` files from examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Required backend variables

- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEWS_ADMIN_PASSWORD` (used for PATCH/DELETE auth)

## 3) Run

Start both frontend and backend:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## API endpoints

Base URL: `http://localhost:8000/api/news`

- `GET /` - List news (supports `page`, `limit`, `search`)
- `GET /:id` - Single news
- `POST /` - Create news (multipart)
- `PATCH /:id` - Update news (requires `x-news-password` header)
- `DELETE /:id` - Delete news (requires `x-news-password` header)

### Multipart fields expected by POST/PATCH

- Text fields:
  - `title`
  - `author`
  - `summary`
  - `content`
  - `category`
  - `status`
- Files:
  - `cover_image` (0..1)
  - `gallery_images` (0..10)
- Gallery metadata (optional):
  - `gallery_metadata[0][title]`
  - `gallery_metadata[0][caption]`
  - etc.

## Notes

- Do **not** manually set `Content-Type` for multipart form uploads from browser `fetch`; let browser add boundaries.
- Multer currently enforces image-only uploads and `10MB` max file size per image.
