Perfect bhai! 🎉
Your backend + frontend + redirects sab flawlessly work kar rahe hain — which means you’re ready for a **professional README.md**.

👇 **Ye README completely recruiter-ready, clean, technical, and production-standard hai.**
Isko bas copy → project root me `README.md` create karke paste kar dena.

---

# ✅ **TinyLink — URL Shortening Service (Next.js + Prisma + PostgreSQL)**

TinyLink is a fully-functional, production-grade URL shortener built using **Next.js (Pages Router)**, **Prisma ORM**, **PostgreSQL**, and **Tailwind CSS**.
It includes a dashboard UI, API endpoints, redirect logic, analytics (click tracking), soft delete, and persistent storage.

This project was built as a technical demonstration following real industry patterns such as:

* Server-side redirect handling
* SSR-safe Prisma client
* Fully typed REST API
* Reusable React components
* Clean DB schema with migrations + seed

---

## 🚀 **Features**

### **🔗 URL Shortening**

* Shorten any long URL
* Supports custom codes (6–8 characters)
* Automatic unique code generation

### **📡 REST API (Next.js API Routes)**

* `POST /api/links` → Create new short link
* `GET /api/links` → List all non-deleted links
* `GET /api/links/:code` → Fetch link details
* `DELETE /api/links/:code` → Soft delete

### **📈 Redirect Analytics**

* Redirect page: `/[code]`
* Server-side redirect (302)
* Tracks:

  * Number of clicks
  * Last click timestamp

### **🖥️ Dashboard UI**

* Built using React + Tailwind
* Create Link Form (react-hook-form)
* Table listing all links
* Delete button
* Click redirect + analytics visible immediately

---

## 🛠️ **Tech Stack**

| Layer            | Tech                                        |
| ---------------- | ------------------------------------------- |
| Frontend         | Next.js (Pages Router), React, Tailwind 4.1 |
| Backend          | Next.js API Routes                          |
| ORM              | Prisma                                      |
| Database         | PostgreSQL (Neon)                           |
| State/Forms      | React Hooks, react-hook-form                |
| Deployment-Ready | Vercel / Any Node host                      |

---

## 📦 **Project Structure**

```
src/
 ├─ pages/
 │   ├─ index.tsx            # Dashboard UI
 │   ├─ [code].tsx           # Redirect page
 │   └─ api/
 │       └─ links/
 │            ├─ index.ts    # POST/GET routes
 │            └─ [code].ts   # GET/DELETE routes
 ├─ components/
 │   ├─ forms/
 │   │    └─ CreateLinkForm.tsx
 │   └─ tables/
 │        └─ LinksTable.tsx
 └─ lib/
      ├─ prisma.ts
      └─ fetcher.ts
prisma/
 ├─ schema.prisma
 └─ seed.js
```

---

## 🗄️ **Database Schema (Prisma)**

```prisma
model Link {
  id          Int       @id @default(autoincrement())
  code        String    @unique
  target      String
  clicks      Int       @default(0)
  createdAt   DateTime  @default(now())
  lastClicked DateTime?
  deleted     Boolean   @default(false)
}
```

---

## ⚙️ **Setup & Installation**

### **1️⃣ Install dependencies**

```
npm install
```

### **2️⃣ Setup environment**

Create `.env`:

```
DATABASE_URL="your_postgres_connection_string"
```

### **3️⃣ Generate Prisma client**

```
npx prisma generate
```

### **4️⃣ Run migrations**

```
npx prisma migrate dev --name init
```

### **5️⃣ Seed database**

```
node prisma/seed.js
```

### **6️⃣ Start development server**

```
npm run dev
```

Open:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🧪 API Testing Examples (curl)

### Create new link

```
curl -X POST http://localhost:3000/api/links \
-H "Content-Type: application/json" \
-d "{\"target\":\"https://example.com\",\"code\":\"mycode1\"}"
```

### Get list

```
curl http://localhost:3000/api/links
```

### Get single link

```
curl http://localhost:3000/api/links/mycode1
```

### Delete link

```
curl -X DELETE http://localhost:3000/api/links/mycode1
```

---

## 🔁 Redirect Behavior

Visit any short code in browser:

```
http://localhost:3000/<code>
```

It will:

1. Validate the code
2. Increment click count
3. Update lastClicked
4. Redirect 302 → actual URL

---

## 🧹 **Soft Delete**

DELETE does not remove records permanently.
They remain in DB with:

```
deleted = true
```

And are excluded from:

* GET /api/links
* UI table
* Redirects

---



---

## 🧑‍💻 **Author**

**Aftab Tamboli**
Web Developer — React, Next.js, Django, FastAPI, Prisma, Tailwind

---



---
