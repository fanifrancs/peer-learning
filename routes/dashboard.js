const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth_middleware');

router.get("/dashboard", requireAuth, async(req, res) => {
    try {
        // Query the learning table to get all trainer emails
        const { data: learningData, error: learningError } = await supabase
        .from("learning")
        .select("trainer_email");

        if (learningError) {
            console.log(learningError);
            throw learningError; // if something went wrong
        }
        console.log(learningData)

        // Extract unique trainer emails
        const trainerEmails = [...new Set(learningData.map(row => row.trainer_email))];
        console.log(trainerEmails);

        let trainers = []; // this will hold the user objects

        // If there are trainers, fetch their details from the users table
        if (trainerEmails.length > 0) {
            const { data: trainerData, error: userError } = await supabase
            .from("users")
            .select("*")
            .in("email", trainerEmails); // query users whose email is in trainerEmails array

            if (userError) throw userError;

            trainers = trainerData; // store the user objects

            // Fetch and attach skills for each trainer
            for (let i = 0; i < trainers.length; i++) {
                const trainer = trainers[i];

                const { data: skillsData, error: skillsError } = await supabase
                .from("skills")
                .select("skill")
                .eq("user_email", trainer.email);

                if (skillsError) {
                    console.error(`Error fetching skills for ${trainer.email}:`, skillsError.message);
                    trainer.skills = [];
                } else {
                    // Attach skills as an array or comma-separated string
                    trainer.skills = skillsData.map(s => s.skill).join(", ");
                }
            }
        }
        console.log(trainers);

        //Send the array of trainers to dashboard.ejs
        res.render("dashboard", { trainers });
        
    } catch (error) {
        console.error("Dashboard error:", error.message);
        // If something fails, just send an empty array to EJS so template doesn't break
        res.render("dashboard", { trainers: [] });
    }
})

module.exports = router;
