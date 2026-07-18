# NO-DUES Backend

This backend provides a MERN-compatible REST API for the NO-DUES frontend.

## Setup

1. Copy `.env.example` to `.env`
2. Set `MONGO_URI` and `JWT_SECRET`
3. Install dependencies:

```bash
cd backend
npm install
```

4. Seed initial accounts and a sample student:

```bash
npm run seed
```

5. Start the server:

```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/students`
- `GET /api/students/:usn`
- `POST /api/students/bulk`
- `PUT /api/students/:usn/dues`
- `PUT /api/students/:usn/clearance`
- `PUT /api/students/:usn/approve/cc`
- `PUT /api/students/:usn/approve/admin`
- `PUT /api/students/:usn/faculty`

## Notes

- Staff roles can login with `admin123`, `account123`, `cc123`, `faculty123`
- Sample student USN: `1AT23CG001`, password: `1AT23CG001`
