# Blog Pro 📝

**Blog Pro** is a full-stack blogging platform built with **Next.js** (frontend) and **Node.js + Express.js** (backend).  
It supports features like authentication, post management, admin dashboard, category creation, and more!

---

## 🚀 Tech Stack

- **Frontend:** Next.js 14, React.js, TypeScript, Tailwind CSS, Flowbite
  
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
  
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
  MONGO_URI=your_mongodb_uri
  PORT=5000
  NODE_ENV=development
  JWT_SECRET=your_secret_key
  
  CLIENT_DOMAIN=http://localhost:3000
  
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  
  APP_EMAIL_ADDRESS=your_email@example.com
  APP_EMAIL_PASSWORD=your_email_password
```

Frontend .env

```bash
  NEXT_PUBLIC_API_URL=http://localhost:5000
  NODE_ENV=development
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

The backend will be running at http://localhost:5000

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

## 📋 Future Improvements

- Add Multi-language (i18n) support

- Implement Soft Delete for Posts

## 🤝 Contributing

Contributions are welcome!

Feel free to fork the repository and open a pull request.

## 🔗 Connect With Me

GitHub: https://github.com/onepiece-coding

LinkedIn: https://www.linkedin.com/in/lahcen-alhiane-0799ba303/

🚀 Happy Blogging!
