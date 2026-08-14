store-rating-app/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # DB connection
│   ├── routes/
│   │   ├── auth.js                # signup, login, update password
│   │   ├── admin.js                # add user/store, dashboard stats, listings
│   │   ├── stores.js               # list/search stores, submit/update rating
│   │   └── owner.js                # owner dashboard
│   ├── middleware/
│   │   ├── auth.js                 # verify JWT
│   │   └── checkRole.js            # role gate (admin/user/owner)
│   ├── validators.js               # all field validation in one file
│   ├── schema.sql                  # single file with all table definitions
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── AdminDashboard.jsx  # stats + user/store tables + add forms
│   │   │   ├── UserStores.jsx      # store list + search + rating
│   │   │   └── OwnerDashboard.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Table.jsx           # reusable sortable table
│   │   │   └── StoreCard.jsx
│   │   ├── AuthContext.jsx         # holds user + token + role
│   │   ├── api.js                  # single axios instance + all API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md