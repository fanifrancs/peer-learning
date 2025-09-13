const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

router.get("/pw_reset", (req, res) => {
  res.render("forgot_password/pw_reset");
});

router.get("/email_otp", (req, res) => {
  res.render("forgot_password/email_otp");
});

router.get("/new_pw", (req, res) => {
  res.render("forgot_password/new_pw");
});

router.get("/pwr_success", (req, res) => {
  res.render("forgot_password/pwr_success");
});

module.exports = router;
