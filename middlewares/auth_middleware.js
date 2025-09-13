function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Prevent logged-in users from accessing login/register
function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { requireAuth, redirectIfLoggedIn };
