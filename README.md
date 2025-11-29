# Blog Pro 📝

**Blog Pro** is a full-stack blogging platform built with **Next.js** (frontend) and **Node.js + Express.js** (backend).  
It supports features like authentication, post management, admin dashboard, category creation, and more!

---

## 🚀 Tech Stack

- **Frontend:** Next.js 14, React.js, TypeScript, Tailwind CSS, Flowbite
  
- **Backend:** Node.js, Express.js, Typescript, MongoDB, Mongoose, Jest
  
- **Authentication:** JWT (JSON Web Tokens)
  
- **Image Uploads:** Cloudinary
  
- **Email Services:** NodeMailer

- **State Management:** React Context API

---

## 🛠️ Installation and Setup Instructions

### 1. Clone the Repository

```bash
  git clone https://github.com/onepiece-coding/mern-stack-and-next.js-blog-pro.git
  cd mern-stack-and-next.js-blog-pro
```

### 2. Install Dependencies
   
Backend

```bash
  cd backend
  npm install
```

Frontend

```bash
  cd frontend
  npm install
```

### 3. Environment Variables Setup
   
Create a .env file in both the backend and frontend folders.

Backend .env

```bash
PORT=
MONGO_URI=
NODE_ENV=
JWT_SECRET==
COOKIE_SECRET=
CLIENT_DOMAIN=
APP_EMAIL_ADDRESS=
APP_EMAIL_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Frontend .env

```bash
  NEXT_PUBLIC_API_URL=
  NODE_ENV=
````

### 4. Running the Application

Start Backend Server

```bash
  cd backend
  npm run dev
```

Start Frontend Server

```bash
  cd frontend
  npm run dev
```

The frontend will be running at http://localhost:3000

The backend will be running at http://localhost:8000

---

## ✨ Features

- User Registration and Login (JWT)

- Admin Dashboard

- Create / Update / Delete Posts

- Filtering, Pagination and Search

- Manage Categories

- Manage Users and Comments (Admin Only)

- Upload Images to Cloudinary

- Protected Routes for Authenticated Users

- Light and Dark Theme Support

- Responsive Design
  
- Improved SEO with dynamic meta tags

- Password Reset Functionality

---

## 📋 Future Improvements

- Add Multi-language (i18n) support

- Implement Soft Delete for Posts

---

## 🤝 Contributing

Contributions are welcome!

Feel free to fork the repository and open a pull request.

## 🔗 Connect With Me

github: [open it](https://github.com/onepiece-coding)

Email: [open it](onepiececoding@gmail.com)

🚀 Happy Blogging!
