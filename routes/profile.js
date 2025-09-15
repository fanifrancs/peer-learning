const express = require('express');
const multer = require("multer");
const router = express.Router();
const supabase = require('../db/supabase');
const { requireAuth } = require('../middlewares/auth_middleware');

// Multer config: store files in memory instead of disk
const upload = multer({ storage: multer.memoryStorage() });

router.get("/profile", requireAuth, async(req, res) => {
    try {
        const email = req.session.user.email; // already logged in user

        const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

        if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Error fetching user:", fetchError.message);
            return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
        }

        // Fetch skills for this user
        let skillsString = "";
        if (existingUser) {
            const { data: skillsData, error: skillsError } = await supabase
            .from("skills")
            .select("skill")
            .eq("user_email", email);

            if (skillsError) {
                console.error("Error fetching skills:", skillsError.message);
                return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
            } else if (skillsData) {
                // Join into comma-separated string
                skillsString = skillsData.map(s => s.skill).join(",");
            }
        }

        // console.log(existingUser);

        // Check if user is already a trainer
        const { data: trainerData } = await supabase
        .from("trainers")
        .select("*")
        .eq("user_email", email)
        .single();

        const isTrainer = trainerData ? true : false;

        // console.log(isTrainer);

        res.render("profile", {existingUser, skills: skillsString, isTrainer});
    } catch (error) {
        console.error("Profile page error:", error.message);
        return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
    }
    
})

// router.post("/profile", requireAuth, upload.single("profile_pic"), async(req, res) => {
//     try {
//         const { first_name, last_name, skills, age, whatsapp } = req.body;
//         const email = req.session.user.email; // already logged in user

//         const { data: existingUser, error: fetchError } = await supabase
//         .from("users")
//         .select("*")
//         .eq("email", email)
//         .single();

//         if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 = no rows found
//             console.error("Error checking user:", fetchError.message);
//             return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
//         }
        
//         // Handle profile picture upload to Supabase
//         let profilePicUrl = null;
//         if (req.file) {
//             // unique file name to avoid overwriting
//             const fileName = `${Date.now()}-${req.file.originalname}`;

//             // upload file buffer to supabase storage
//             const { error: uploadError } = await supabase.storage
//             .from("profile_pic") // bucket name
//             .upload(fileName, req.file.buffer, {
//                 contentType: req.file.mimetype,
//                 upsert: true
//             })

//             if (uploadError) {
//                 console.error("Storage upload error:", uploadError.message);
//                 return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
//             }

//             // get public URL for the uploaded file
//             const { data: publicUrlData } = supabase.storage
//             .from("profile_pic")
//             .getPublicUrl(fileName);

//             profilePicUrl = publicUrlData.publicUrl;

//             if (existingUser) {
//                 const { error: updateError } = await supabase
//                 .from("users")
//                 .update({
//                     firstname: first_name,
//                     lastname: last_name,
//                     age: age ? parseInt(age) : null,
//                     whatsapp,
//                     profile_picture: profilePicUrl,
//                 })
//                 .eq("email", email);

//                 if (updateError) {
//                     console.error("User update error:", updateError.message);
//                     return res.send('Could not update profile. <a href="/profile">Go back to profile</a>');
//                 }

//                 // Insert skills into skills table (split by commas)
//                 if (skills && skills.trim() !== "") {
//                     const skillsArray = skills.split(",").map(s => s.trim());

//                     const skillRows = skillsArray.map(skill => ({
//                         user_email: email,
//                         skill
//                     }))

//                     const {error: skillsDeleteError} = await supabase
//                     .from("skills")
//                     .delete()
//                     .eq("user_email", email);

//                     if (skillsDeleteError) {
//                         console.error("Skills insert error:", skillsDeleteError.message);
//                         return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
//                     }

//                     const { error: skillsUpdateError } = await supabase
//                     .from("skills")
//                     .insert(skillRows);

//                     if (skillsUpdateError) {
//                         console.error("Skills insert error:", skillsUpdateError.message);
//                         return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
//                     }
//                     return res.send('Profile update successful. <a href="/profile">Go back to profile</a>');
//                 }
//             }

//             const { error: userError } = await supabase
//             .from("users")
//             .insert([
//                 {
//                     email,
//                     firstname: first_name,
//                     lastname: last_name,
//                     age: age ? parseInt(age) : null,
//                     whatsapp,
//                     profile_picture: profilePicUrl
//                 }
//             ]);

//             if (userError) {
//                 console.error("User insert error:", userError.message);
//                 return res.send('Something went wrong. <a href="/profile">Go back to profile</a>')
//             }

//             // Insert skills into skills table (split by commas)
//             if (skills && skills.trim() !== "") {
//                 const skillsArray = skills.split(",").map(s => s.trim());

//                 const skillRows = skillsArray.map(skill => ({
//                     user_email: email,
//                     skill
//                 }));

//                 const { error: skillsError } = await supabase
//                 .from("skills")
//                 .insert(skillRows);

//                 if (skillsError) {
//                     console.error("Skills insert error:", skillsError.message);
//                     return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
//                 }
//             }

//             // Redirect after success
//             res.redirect("/dashboard");
//         }
//     } catch (error) {
//         console.error("Profile route error:", err);
//         return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
//     }
// })

router.post("/profile", requireAuth, upload.single("profile_pic"), async(req, res) => {
    try {
        const { first_name, last_name, skills, age, whatsapp } = req.body;
        const email = req.session.user.email; // already logged in user

        const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

        if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 = no rows found
            console.error("Error checking user:", fetchError.message);
            return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
        }

        if (existingUser) {
            // User already exists => reject submission
            return res.send('You cannot change/update your profile for now! <a href="/profile">Go back to profile</a>');
        }
        
        // Handle profile picture upload to Supabase
        let profilePicUrl = null;
        if (req.file) {
            // unique file name to avoid overwriting
            const fileName = `${Date.now()}-${req.file.originalname}`;

            // upload file buffer to supabase storage
            const { error: uploadError } = await supabase.storage
            .from("profile_pic") // bucket name
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            })

            if (uploadError) {
                console.error("Storage upload error:", uploadError.message);
                return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
            }

            // get public URL for the uploaded file
            const { data: publicUrlData } = supabase.storage
            .from("profile_pic")
            .getPublicUrl(fileName);

            profilePicUrl = publicUrlData.publicUrl;

            const { error: userError } = await supabase
            .from("users")
            .insert([
                {
                    email,
                    firstname: first_name,
                    lastname: last_name,
                    age: age ? parseInt(age) : null,
                    whatsapp,
                    profile_picture: profilePicUrl
                }
            ]);

            if (userError) {
                console.error("User insert error:", userError.message);
                return res.send('Something went wrong. <a href="/profile">Go back to profile</a>')
            }

            // Insert skills into skills table (split by commas)
            if (skills && skills.trim() !== "") {
                const skillsArray = skills.split(",").map(s => s.trim());

                const skillRows = skillsArray.map(skill => ({
                    user_email: email,
                    skill
                }));

                const { error: skillsError } = await supabase
                .from("skills")
                .insert(skillRows);

                if (skillsError) {
                    console.error("Skills insert error:", skillsError.message);
                    return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
                }
            }

            // Redirect after success
            res.redirect("/dashboard");
        }
    } catch (error) {
        console.error("Profile route error:", err);
        return res.send('Something went wrong! <a href="/profile">Go back to profile</a>');
    }
})

module.exports = router;
