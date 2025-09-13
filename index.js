const express = require("express");
const session = require('express-session')
const path = require("path");

const app = express();
const PORT = 3000;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "super-secret-key",   // change this to something secure
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }     // set true if using HTTPS
}))

// routes
const indexRoutes = require('./routes/index');
const signupRoutes = require('./routes/signup');
const loginRoutes = require('./routes/login');
const profileRoutes = require('./routes/profile');
const trainerRoutes = require('./routes/trainer');
const dashboardRoutes = require('./routes/dashboard');
const logoutRoutes = require('./routes/logout');

// use routes
app.use('/', indexRoutes);
app.use('/', signupRoutes);
app.use('/', loginRoutes);
app.use('/', profileRoutes);
app.use('/', trainerRoutes);
app.use('/', dashboardRoutes);
app.use('/', logoutRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
