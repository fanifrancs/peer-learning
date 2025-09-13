const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth_middleware');

router.get("/trainer/apply", requireAuth, (req, res) => {
    res.render('trainer_apply');
})

router.post("/trainer/apply", requireAuth, async(req, res) => {
    try {
        const email = req.session.user.email; // Logged-in user email

    // Check if user is already a trainer
    const { data: existingTrainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_email", email)
    .single();

    // Get user id from users table
    const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

    if (!userData) {
      return res.status(400).send("User not found");
    }

    const userId = userData.id;

    if (existingTrainer) {
        // Already a trainer => redirect to /trainer/:id
        //   return res.render(`/trainer/${userId}`, { message: 'You are already a trainer'});
       return res.send("You're already a trainer. <a href='/profile'>Return to profile</a>");
    }

    // Collect inputs from the form
    const { what_teach, expertise } = req.body;

    // Insert into trainer table
    const { error: insertError } = await supabase
      .from("trainers")
      .insert([
        {
          user_email: email,
          teach: what_teach,
          expertise_level: expertise ? parseInt(expertise) : null
        }
      ]);

    if (insertError) throw insertError;

    // render trainer/:id page
    // res.render(`/trainer/${userId}`, { message: 'You have successfully signed up as a trainer'});
    res.send("You have successfully signed up as a trainer. <a href='/profile'>Return to profile</a>");

  } catch (err) {
    console.error("Apply trainer error:", err.message);
    res.status(500).send("Something went wrong. <a href='/profile'>Return to profile</a>");
  }
})

router.get("/trainer/:id", requireAuth, async (req, res) => {
  const trainerId = req.params.id; // gets the dynamic "id" from the URL
  res.send(`trainer page with user id ${trainerId}`);

//   try {
//     // Fetch trainer data from database
//     const { data: trainerData, error } = await supabase
//       .from("trainer")
//       .select("*")
//       .eq("email", trainerId) // or "id" if you store userId
//       .single();

//     if (error || !trainerData) {
//       return res.status(404).send("Trainer not found");
//     }

//     // Render trainer page
//     res.render("trainer", { trainer: trainerData });

//   } catch (err) {
//     console.error("Trainer page error:", err.message);
//     res.status(500).send("Something went wrong.");
//   }

})

module.exports = router;
