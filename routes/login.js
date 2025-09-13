const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { redirectIfLoggedIn } = require('../middlewares/auth_middleware');

router.get("/login", redirectIfLoggedIn, (req, res) => {
  res.render("login");
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message);
    return res.render("login", { error: error.message });
  }

  // Save user session
  req.session.user = data.user;

  // check if user has a row in "users" table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('email', data.user.email)
    .single();

    req.session.save(() => {
        if (!profile) {
            return res.redirect('/profile');
        }
        res.redirect('/dashboard');
    });
})

module.exports = router;
