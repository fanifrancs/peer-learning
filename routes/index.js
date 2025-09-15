const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

router.get('/test_db', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').limit(1);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Database connected ✅', data });

})

router.get("/", (req, res) => {
  res.render("land-page");
})

module.exports = router;
