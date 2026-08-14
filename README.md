# ⭐ Store Rating Application

A modern **full-stack web application** that allows users to **discover stores, submit ratings, and manage store feedback** through a secure role-based system.

Built with **React, Node.js, Express, and MySQL**, the application supports **System Administrators, Normal Users, and Store Owners**, each with dedicated dashboards and permissions.

**Repository:** `dnyanesshwari/Store-Ratting-Application`

---

## 🚀 Tech Stack

### Frontend

* **React.js**
* **Vite**
* **Axios**
* **React Router DOM**
* **CSS**

### Backend

* **Node.js**
* **Express.js**
* **JWT Authentication**
* **bcryptjs**
* **MySQL**

### Database

* **MySQL**

---

## ✨ Features

### 👤 Normal User

* Register and log in
* Browse all registered stores
* Search stores by **name** or **address**
* Submit ratings from **1–5 stars**
* Update previously submitted ratings
* Change password after login

### 🏪 Store Owner

* Secure login
* View **average store rating**
* See all users who rated their store
* Track recent ratings
* Update password

### 🛠️ System Administrator

* Add **stores**, **normal users**, and **admin users**
* View dashboard statistics:

  * Total Users
  * Total Stores
  * Total Ratings
* Manage users and stores
* Filter and sort listings
* View detailed user information

---

## 📸 Screenshots

### Admin Dashboard

Add screenshot here

### Store Listing

Add screenshot here

### Store Details

Add screenshot here

### Owner Dashboard

Add screenshot here

---

## 📂 Project Structure

```text
Store-Ratting-Application/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── stores.js
│   │   └── owner.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── checkRole.js
│   ├── validators.js
│   ├── schema.sql
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserStores.jsx
│   │   │   └── OwnerDashboard.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Table.jsx
│   │   │   └── StoreCard.jsx
│   │   ├── AuthContext.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/dnyanesshwari/Store-Ratting-Application.git
cd Store-Ratting-Application
```

---

## 🗄️ Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment Variables

Create a **.env** file inside `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=store_ratings
JWT_SECRET=your_secret_key
```

### Create Database

Import the schema:

```bash
mysql -u root -p < schema.sql
```

### Start Backend Server

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## 🎨 Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Start Frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🔐 Authentication & Authorization

The application uses **JWT-based authentication**.

### User Roles

| Role            | Access                                            |
| --------------- | ------------------------------------------------- |
| **Admin**       | Manage users, stores, and view platform analytics |
| **User**        | Browse stores and submit ratings                  |
| **Store Owner** | View ratings and store analytics                  |

Protected routes are enforced through:

* `auth.js` → verifies JWT token
* `checkRole.js` → restricts access by role

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/signup`   | Register new user |
| POST   | `/api/auth/login`    | Login             |
| PUT    | `/api/auth/password` | Update password   |

### Stores

| Method | Endpoint                 | Description    |
| ------ | ------------------------ | -------------- |
| GET    | `/api/stores`            | Get all stores |
| GET    | `/api/stores/search`     | Search stores  |
| POST   | `/api/stores/:id/rating` | Submit rating  |
| PUT    | `/api/stores/:id/rating` | Update rating  |

### Admin

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/api/admin/dashboard` | Dashboard statistics |
| GET    | `/api/admin/users`     | List users           |
| GET    | `/api/admin/stores`    | List stores          |
| POST   | `/api/admin/users`     | Add user             |
| POST   | `/api/admin/stores`    | Add store            |

### Store Owner

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/api/owner/dashboard` | Owner dashboard data |

---

## 🧪 Form Validations

The backend validates all fields centrally through `validators.js`.

| Field        | Validation                                                            |
| ------------ | --------------------------------------------------------------------- |
| **Name**     | 20–60 characters                                                      |
| **Address**  | Maximum 400 characters                                                |
| **Email**    | Standard email format                                                 |
| **Password** | 8–16 characters, at least **1 uppercase** and **1 special character** |

---

## 📊 Key Functionalities

### Admin Dashboard

* KPI cards
* User management
* Store management
* Sorting and filtering
* Rating analytics

### Store Listing

* Search by name or address
* Responsive store cards
* Average rating display
* User-specific rating status

### Owner Dashboard

* Average rating
* Rating distribution
* Recent rating activity
* Customer feedback overview

---

## 🌐 Deployment

### Frontend (Vercel)

Build the frontend:

```bash
npm run build
```

Set environment variable:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

### Backend (Render / Railway)

Start command:

```bash
npm start
```

Environment variables:

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=store_ratings
JWT_SECRET=
```

---

## 📈 Future Improvements

* ⭐ Interactive star-rating component
* 📊 Recharts analytics dashboard
* 🌙 Dark mode
* 📧 Email verification
* 🔔 Toast notifications
* 📱 Enhanced mobile responsiveness
* 📝 Store owner replies to reviews
* 📤 Export ratings to CSV/PDF

---

## 🛡️ Best Practices Used

* Modular Express architecture
* Reusable React components
* Centralized API service (`api.js`)
* JWT authentication
* Password hashing with bcrypt
* Environment variable management
* Sortable reusable table component
* Separation of frontend and backend concerns

---

## 👩‍💻 Author

**Dnyaneshwari Pawar**

* **GitHub:** https://github.com/dnyanesshwari
* **LinkedIn:** https://www.linkedin.com/in/dnyaneshwari-pawar-2986742b8/

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Show Your Support

If you found this project useful, please consider giving it a **star ⭐ on GitHub**.

**Store Rating Application — Better Reviews. Better Decisions. 🚀**
