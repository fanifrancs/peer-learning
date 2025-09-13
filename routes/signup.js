const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { redirectIfLoggedIn } = require('../middlewares/auth_middleware');

router.get("/signup", redirectIfLoggedIn, (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.render('signup', { error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.render('signup', { error: 'Password must be at least 6 characters' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

    //console.log(data);

  if (error) {
    console.error("Signup error:", error.message);
    return res.render("signup", { error: error.message }); // EJS error feedback
  }

  res.render("login", { message: "Sign up successful! Check your email to confirm signup then login afterwards." });
})

module.exports = router;
