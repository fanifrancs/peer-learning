const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth_middleware');

router.get("/dashboard", requireAuth, async(req, res) => {
    try {
        // Query the trainers table to get all trainer emails
        const { data: trainersData, error: trainersError } = await supabase
        .from("trainers")
        .select("user_email");

        if (trainersError) {
            console.log(trainersError);
            throw trainersError; // if something went wrong
        }

        // console.log(learningData)

        // Extract unique trainer emails
        const trainerEmails = [...new Set(trainersData.map(row => row.user_email))];

        // console.log(trainerEmails);

        let trainers = []; // this will hold the user objects

        // If there are trainers, fetch their details from the users table
        if (trainerEmails.length > 0) {
            const { data: trainerData, error: userError } = await supabase
            .from("users")
            .select("*")
            .in("email", trainerEmails); // query users whose email is in trainerEmails array

            if (userError) {
                console.error(userError);
                throw userError;
            }

            trainers = trainerData; // store the user objects

            // Fetch and attach skills for each trainer
            for (let i = 0; i < trainers.length; i++) {
                const trainer = trainers[i];

                const { data: skillsData, error: skillsError } = await supabase
                .from("skills")
                .select("skill")
                .eq("user_email", trainer.email);

                if (skillsError) {
                    console.error(skillsError);
                    return res.send('Something went wrong. <a href="/dashboard">Go back to dashboard</a>');
                    // trainer.skills = [];
                } else {
                    // Attach skills as an array or comma-separated string
                    trainer.skills = skillsData.map(s => s.skill).join(",");
                }
            }
        }

        // console.log(trainers);

        //Send the array of trainers to dashboard.ejs
        // req.flash("info_msg", trainers);
        return res.render("dashboard", { trainers });
        
    } catch (error) {
        console.error("Dashboard error:", error.message);
        return res.send('Something went wrong. <a href="/dashboard">Go back to dashboard</a>');
    }
})

// router.get("/dashboard", requireAuth, async(req, res) => {
//     try {
//         // Query the learning table to get all trainer emails
//         const { data: learningData, error: learningError } = await supabase
//         .from("learning")
//         .select("trainer_email");

//         if (learningError) {
//             console.log(learningError);
//             throw learningError; // if something went wrong
//         }

//         // console.log(learningData)

//         // Extract unique trainer emails
//         const trainerEmails = [...new Set(learningData.map(row => row.trainer_email))];
//         // console.log(trainerEmails);

//         let trainers = []; // this will hold the user objects

//         // If there are trainers, fetch their details from the users table
//         if (trainerEmails.length > 0) {
//             const { data: trainerData, error: userError } = await supabase
//             .from("users")
//             .select("*")
//             .in("email", trainerEmails); // query users whose email is in trainerEmails array

//             if (userError) {
//                 console.error(userError);
//                 throw userError;
//             }

//             trainers = trainerData; // store the user objects

//             // Fetch and attach skills for each trainer
//             for (let i = 0; i < trainers.length; i++) {
//                 const trainer = trainers[i];

//                 const { data: skillsData, error: skillsError } = await supabase
//                 .from("skills")
//                 .select("skill")
//                 .eq("user_email", trainer.email);

//                 if (skillsError) {
//                     console.error(skillsError);
//                     return res.send('Something went wrong. <a href="/dashboard">Go back to dashboard</a>');
//                     // trainer.skills = [];
//                 } else {
//                     // Attach skills as an array or comma-separated string
//                     trainer.skills = skillsData.map(s => s.skill).join(",");
//                 }
//             }
//         }

//         // console.log(trainers);

//         //Send the array of trainers to dashboard.ejs
//         // req.flash("info_msg", trainers);
//         return res.render("dashboard", { trainers });
        
//     } catch (error) {
//         console.error("Dashboard error:", error.message);
//         return res.send('Something went wrong. <a href="/dashboard">Go back to dashboard</a>');
//     }
// })

module.exports = router;
