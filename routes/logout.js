const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth_middleware');

router.get('/logout', requireAuth, (req, res) => {
  req.session.destroy(error => {
    if (error) {
      console.error("Logout error:", error);
      return res.redirect('/dashboard'); // fallback if error
    }

    // Clear the cookie too
    res.clearCookie('connect.sid'); // default cookie name from express-session
    res.redirect('/login');
  })
})


module.exports = router;
