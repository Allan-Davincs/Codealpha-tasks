# FlexCart 🛒

FlexCart is a **full‑stack e‑commerce internship project** focused on selling **tech accessories**. The project demonstrates modern web development practices using **HTML, CSS, JavaScript, Node.js, Express, and MongoDB**, with authentication and cart functionality.

---

## 🚀 Live Demo

* **Frontend:** [https://flexcart.vercel.app](https://flexcart.vercel.app)
* **Backend API:** [https://flex-cart-backend.onrender.com](https://flex-cart-backend.onrender.com)

---

## 📌 Features

### Frontend

* Responsive UI using **HTML & CSS**
* Product listing (Tech Accessories)
* Product details page
* Cart functionality (Add / View items)
* Authentication check before adding to cart
* Login & Register pages
* Cart count synced with localStorage

### Backend

* RESTful API using **Node.js & Express**
* MongoDB database with **Mongoose**
* User authentication using **JWT**
* Secure environment variables using **dotenv**
* Clean MVC‑style folder structure

---

## 🛠️ Tech Stack

**Frontend:**

* HTML5
* CSS3
* JavaScript (Vanilla JS)

**Backend:**

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

**Deployment:**

* Frontend: Vercel
* Backend: Render

---

## 📂 Project Structure

```
FlexCart/
│
├── frontend/
│   ├── index.html
│   ├── product.html
│   ├── cart.html
│   ├── login.html
│   ├── register.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── config.js
│   │   ├── main.js
│   │   ├── products.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   └── auth.js
│   └── assets/
│       └── images/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   └── routes/
│       ├── auth.js
│       ├── products.js
│       └── orders.js
│
└── README.md
```

---

## 🔐 Authentication Flow

1. User registers or logs in
2. Backend validates credentials
3. JWT token is generated
4. Token is stored in `localStorage`
5. Cart actions are blocked if token is missing

---

## ⚙️ Environment Variables (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> ⚠️ `.env` is ignored from GitHub for security reasons

---

## ▶️ Running the Project Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

Open `index.html` using Live Server or browser

---

## 🧠 Learning Outcomes

* Full‑stack architecture
* REST API design
* JWT‑based authentication
* Frontend‑backend integration
* Secure configuration using environment variables
* Deployment on cloud platforms

---

## 👨‍💻 Author

**Allan Da Vinci**
Internship Project – FlexCart

---

## 📄 License

This project is licensed under the **MIT License**.
