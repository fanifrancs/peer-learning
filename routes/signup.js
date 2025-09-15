const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { redirectIfLoggedIn } = require('../middlewares/auth_middleware');

router.get("/signup", redirectIfLoggedIn, (req, res) => {
  res.render("signup");
})

router.post("/signup", async (req, res) => {
  const { email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    req.flash("error_msg", "Passwords do not match");
    return res.redirect("/signup");
  }

  if (password.length < 6) {
    req.flash("error_msg", "Password must be at least 6 characters");
    return res.redirect("/signup");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  //console.log(data);

  if (error) {
    console.error("Signup error:", error.message);
    req.flash("error_msg", error.message);
    return res.redirect("/signup");
  }

  // req.flash("success_msg", "Sign up successful! Check your email to confirm signup then login afterwards.");
  res.render('successful-signup');

})

module.exports = router;
