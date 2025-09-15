const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth_middleware');

router.post("/search", requireAuth, async(req, res) => {
    try {
        const skill = req.body.skill;

        const { data: matchedSkills, error: skillsError } = await supabase
        .from("skills")
        .select("user_email")
        .ilike("skill", `%${skill}%`);

        if (skillsError) {
            return console.error("Error fetching skills:", skillsError);
        }

        const emails = matchedSkills.map(row => row.user_email);

        if (emails.length === 0) {
            console.log("No trainers found with that skill");
            return res.send('No trainers found');
        }

        res.send(matchedSkills)

    } catch (error) {
        console.log(error);
        return res.send('Something went wrong. <a href="/dashboard">Go back to dashboard</a>')
    }
})

module.exports = router;
