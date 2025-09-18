const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth_middleware');

router.get("/dashboard", requireAuth, async (req, res) => {
    try {
        // Fetch all trainers and join their user + skills info
        const { data: trainersData, error: trainersError } = await supabase
        .from("trainers")
        .select(`
            user_email,
            users (
                id,
                firstname,
                lastname,
                email,
                age,
                whatsapp,
                profile_picture
            )
        `)

        if (trainersError) {
            console.error("Error fetching trainers:", trainersError.message);
            return res.send('Something went wrong! <a href="/">Go home</a>');
        }

        if (!trainersData || trainersData.length === 0) {
            return res.render("dashboard", { trainers: [] });
        }

        // Collect all trainer emails
        const trainerEmails = trainersData.map(t => t.user_email);

        // Fetch all skills for those trainers in one query
        const { data: skillsData, error: skillsError } = await supabase
        .from("skills")
        .select("user_email, skill")
        .in("user_email", trainerEmails)

        if (skillsError) {
            console.error("Error fetching skills:", skillsError.message);
            return res.send('Something went wrong! <a href="/">Go home</a>');
        }

        // Group skills by email
        const skillsByEmail = {};
        skillsData.forEach(s => {
            if (!skillsByEmail[s.user_email]) {
                skillsByEmail[s.user_email] = [];
            }
            skillsByEmail[s.user_email].push(s.skill);
        })

        // Merge trainers + skills
        let trainers = trainersData.map(t => ({
            id: t.users.id,
            firstname: t.users.firstname,
            lastname: t.users.lastname,
            email: t.users.email,
            age: t.users.age,
            whatsapp: t.users.whatsapp,
            profile_picture: t.users.profile_picture,
            skills: skillsByEmail[t.user_email]?.join(",") || ""
        }))

        // Shuffle trainers before sending
        trainers = shuffleArray(trainers);

        return res.render("dashboard", { trainers });

    } catch (err) {
        console.error("Dashboard error:", err.message);
        return res.send('Something went wrong. <a href="/">Go home</a>');
    }
})

// Shuffle array in place (Fisher–Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = router;
