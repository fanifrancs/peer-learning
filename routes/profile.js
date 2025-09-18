const express = require('express');
const multer = require("multer");
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth_middleware');

// Multer config: store files in memory instead of disk
const upload = multer({ storage: multer.memoryStorage() });

router.get("/profile", requireAuth, async(req, res) => {
    try {
        const email = req.session.user.email; // logged-in user

        const { data: profileData, error } = await supabase
        .from("users")
        .select(`
        *,
        skills(skill),
        trainers(*)
        `)
        .eq("email", email)
        .maybeSingle();  // safe: returns null if no match

        if (error) {
            console.error("Profile fetch error:", error.message);
            return res.send('Something went wrong! <a href="/profile">Go back</a>');
        }

        if (!profileData) {
            // no user yet → pass safe defaults
            return res.render("profile", {
                existingUser: null,
                skills: "",
                isTrainer: false
            })
        }

        // Extract skills into a string (comma separated)
        const skillsString = profileData.skills?.map(s => s.skill).join(",") || "";

        // Check if trainer entry exists
        const isTrainer = profileData.trainers && profileData.trainers.length > 0;

        res.render("profile", {
            existingUser: profileData,
            skills: skillsString,
            isTrainer
        })

    } catch (error) {
        console.error("Profile fetch error:", error.message);
        return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
    }
            
})

router.post("/profile", requireAuth, upload.single("profile_pic"), async (req, res) => {
    try {
        const { first_name, last_name, skills, age, whatsapp } = req.body;
        const email = req.session.user.email;

        // Step 1: Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

        if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Error checking user:", fetchError.message);
            return res.send('Something went wrong! <a href="/profile">Go back to profile</a>')
        }

        // Step 2: Handle profile picture upload
        let profilePicUrl = "/img/avatar.jpeg"; // default
        if (req.file) {
            const fileName = `${Date.now()}-${req.file.originalname}`;

            const { error: uploadError } = await supabase.storage
            .from("profile_pic")
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true,
            })

            if (uploadError) {
                console.error("Storage upload error:", uploadError.message);
                return res.send(
                    'Something went wrong! <a href="/profile">Go back to profile</a>'
                )
            }

            const { data: publicUrlData } = supabase.storage
            .from("profile_pic")
            .getPublicUrl(fileName);

            profilePicUrl = publicUrlData.publicUrl;
        }

        // Step 3: Prepare user object
        const userData = {
            email,
            firstname: first_name,
            lastname: last_name,
            age: age ? parseInt(age) : null,
            whatsapp,
            profile_picture: profilePicUrl,
        };

        // Step 4: Insert or update user
        if (existingUser) {
            // Update user
            const { error: updateError } = await supabase
            .from("users")
            .update(userData)
            .eq("email", email);

            if (updateError) {
                console.error("User update error:", updateError.message);
                return res.send('Something went wrong. <a href="/profile">Go back to profile</a>')
            }

            // Clear existing skills
            await supabase.from("skills").delete().eq("user_email", email);
        } else {
            // Insert new user
            const { error: insertError } = await supabase
            .from("users")
            .insert([userData]);

            if (insertError) {
                console.error("User insert error:", insertError.message);
                return res.send('Something went wrong. <a href="/profile">Go back to profile</a>')
            }
        }

        // Step 5: Insert new skills
        if (skills && skills.trim() !== "") {
            const skillsArray = skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

            if (skillsArray.length > 0) {
                const skillRows = skillsArray.map((skill) => ({
                    user_email: email,
                    skill,
                }))

                const { error: skillsError } = await supabase
                .from("skills")
                .insert(skillRows)

                if (skillsError) {
                    console.error("Skills insert error:", skillsError.message);
                    return res.send('Something went wrong! <a href="/profile">Go back to profile</a>')
                }
            }
        }

        res.send('Profile successfully updated. <a href="/profile">Go back to profile</a> / <a href="/dashboard">Find trainers</a>');

    } catch (error) {
        console.error("Profile route error:", error.message);
        return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
    }
})

module.exports = router;
