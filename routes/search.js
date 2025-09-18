const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth_middleware');

router.get("/api/search", requireAuth, async (req, res) => {
    try {
        const skill = req.query.skill?.trim();

        let skillData;

        if (!skill) {
            // empty search: get ALL skills
            const { data, error } = await supabase
            .from("skills")
            .select("user_email, skill")

            if (error) throw error;
            skillData = data;
        } else {
            // normal search: filter by skill
            const { data, error } = await supabase
            .from("skills")
            .select("user_email, skill")
            .ilike("skill", `%${skill}%`)
            
            if (error) throw error;
            skillData = data;
        }
        
        const skillEmails = skillData.map(s => s.user_email);

        if (skillEmails.length === 0) {
            return res.json({ trainers: [] }); // no users found with this skill
        }

        // Filter only those users who are actually trainers
        const { data: trainerData, error: trainerError } = await supabase
        .from("trainers")
        .select("user_email")
        .in("user_email", skillEmails);

        if (trainerError) {
            console.error("Trainer query error:", trainerError);
            return res.status(500).json({ error: "Failed to fetch trainers" });
        }

        const trainerEmails = trainerData.map(t => t.user_email);

        if (trainerEmails.length === 0) {
            return res.json({ trainers: [] }); // none of the skill-users are trainers
        }

        // Fetch user details for these trainers
        const { data: usersData, error: userError } = await supabase
        .from("users")
        .select("*")
        .in("email", trainerEmails);

        if (userError) {
            console.error("Users query error:", userError);
            return res.status(500).json({ error: "Failed to fetch users" });
        }

        // Fetch skills for these trainers
        const { data: skillsAll, error: skillsError } = await supabase
        .from("skills")
        .select("user_email, skill")
        .in("user_email", trainerEmails);

        if (skillsError) {
            console.error("Skills query error:", skillsError);
            return res.status(500).json({ error: "Failed to fetch skills" });
        }

        // Attach skills to each user
        const skillsByEmail = {};
        skillsAll.forEach(s => {
            if (!skillsByEmail[s.user_email]) skillsByEmail[s.user_email] = [];
            skillsByEmail[s.user_email].push(s.skill);
        })

        const trainers = usersData.map(user => ({
            ...user,
            skills: skillsByEmail[user.email]?.join(",") || ""
        }))

        return res.json({ trainers });
    } catch (err) {
        console.error("Search route error:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
})

module.exports = router;
