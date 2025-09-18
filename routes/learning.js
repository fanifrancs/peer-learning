const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth_middleware');

router.get("/learning", requireAuth, async (req, res) => {
    res.send('This page is under construction. <a href="/dashboard">Find Trainers</a>')    
})

router.get("/learning/:whatsapp", requireAuth, async (req, res) => {
    try {
        const whatsapp = req.params.whatsapp;
        const studentEmail = req.session.user.email; // from logged-in session/auth middleware

        // 1. Find the trainer in users table using whatsapp
        const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("whatsapp", whatsapp)
        .single();

        if (userError || !userData) {
            console.error("Trainer not found:", userError);
            return res.status(404).send("Something went wrong! <a href="/">Go home</a>");
        }

        const trainerEmail = userData.email;

        if (trainerEmail === studentEmail) {
            return res.send('You cannot map yourself as your own trainer. <a href="/dashboard">FIND TRAINERS</a>');
        }

        // 2. Check if record already exists
        const { data: existing, error: checkError } = await supabase
        .from("learning")
        .select("id")
        .eq("trainer_email", trainerEmail)
        .eq("student_email", studentEmail)
        .maybeSingle(); // will return null if not found

        if (checkError) {
            console.error("Check error:", checkError);
            return res.status(500).send('Something went wrong! <a href="/dashboard">Find and connect with trainers</a>');
        }

        if (existing) {
            // Already joined
            return res.redirect(`https://wa.me/+234${whatsapp}`)
        }

        // 3. Insert new record
        const { error: insertError } = await supabase
        .from("learning")
        .insert([
            {
            trainer_email: trainerEmail,
            student_email: studentEmail,
            },
        ]);

        if (insertError) {
        console.error("Insert error:", insertError);
        return res.status(500).send("Something went wrong! <a href="/">Go home</a>");
        }

        // Redirect to success
        return res.redirect(`https://wa.me/+234${whatsapp}`); // or wherever you want
    } catch (err) {
        console.error("Learning route error:", err.message);
        return res.status(500).send("Something went wrong! <a href="/">Go home</a>");
    }
})

module.exports = router;
