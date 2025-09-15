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

    return res.render('successful_trainer');
    // return res.send("You have successfully signed up as a trainer. <a href='/profile'>Return to profile</a>");

  } catch (err) {
    console.error("Apply trainer error:", err.message);
    res.status(500).send("Something went wrong. <a href='/profile'>Return to profile</a>");
  }
})

router.get("/trainer/:id", requireAuth, async (req, res) => {
  const trainerId = req.params.id; // gets the dynamic "id" from the URL

  try {
    // Fetch user data from database
    const { data: existingUser, error: fetchUserError } = await supabase
    .from("users")
    .select("*")
    .eq("id", trainerId)
    .single();

    if (fetchUserError || !existingUser) {
      return res.send("Something went wrong. <a href='/dashboard'>Return to dashboard</a>");
    }

    console.log(existingUser);

    const { data: trainerData, error:fetchTrainerError } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_email", existingUser.email)
    .single();

    if (fetchTrainerError || !trainerData) {
      return res.send("Something went wrong. <a href='/dashboard'>Return to dashboard</a>");
    }

    console.log(trainerData)

    // Fetch skills for this user
    let skillsString = "";
    if (existingUser) {
      const { data: skillsData, error: skillsError } = await supabase
      .from("skills")
      .select("skill")
      .eq("user_email", existingUser.email);

      if (skillsError) {
          console.error("Error fetching skills:", skillsError.message);
          return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
      } else if (skillsData) {
          // Join into comma-separated string
          skillsString = skillsData.map(s => s.skill).join(",");
      }
    }

    console.log(skillsString);

    res.render('trainer_page', {existingUser, trainerData, skillsString});

  } catch (err) {
    console.error("Trainer page error:", err.message);
    return res.send("Something went wrong. <a href='/dashboard'>Return to dashboard</a>");
  }

})

module.exports = router;
