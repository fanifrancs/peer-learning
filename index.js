const express = require("express");
const session = require('express-session');
const flash = require("connect-flash");
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
  secret: "your-secret-key", // set to something secure
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if https
    // maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
})

app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.info_msg = req.flash("info_msg");
  next();
})

// routes
const indexRoutes = require('./routes/index');
const signupRoutes = require('./routes/signup');
const loginRoutes = require('./routes/login');
const profileRoutes = require('./routes/profile');
const trainerRoutes = require('./routes/trainer');
const dashboardRoutes = require('./routes/dashboard');
const searchRoutes = require('./routes/search');
const learningRoutes = require('./routes/learning');
const logoutRoutes = require('./routes/logout');

// use routes
app.use('/', indexRoutes);
app.use('/', signupRoutes);
app.use('/', loginRoutes);
app.use('/', profileRoutes);
app.use('/', trainerRoutes);
app.use('/', dashboardRoutes);
app.use('/', searchRoutes);
app.use('/', learningRoutes);
app.use('/', logoutRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
