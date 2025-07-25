const express = require("express");
const router = express.Router();
const Person = require("../Models/person");
const jwt = require("jsonwebtoken");
const AuthMiddleWare = require("../Auth/Authentication");

const multer = require("multer");
const { storage } = require("../Utils/cloudinary"); // ← import your CloudinaryStorage
const upload = multer({ storage }); // ← create the multer instance

const crypto = require("crypto");
const nodemailer = require("nodemailer");

require("dotenv").config(); 
const JWT_SECRET = process.env.JWT_SECRET;
router.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    console.log("Incoming registration data:", { username, email, role });
    console.log("Uploaded file info:", req.file);

    // Validation: Check for duplicates
    const [existingUsername, existingEmail] = await Promise.all([
      Person.findOne({ username }),
      Person.findOne({ email }),
    ]);

    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    if (existingEmail) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    // Get profilePic URL from Cloudinary
    const profilePicUrl = req.file?.path || "";

    const newUser = new Person({
      username,
      email,
      password,
      role,
      profilePic: profilePicUrl,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profilePic: newUser.profilePic,
      },
    });
  } catch (err) {
    console.error("❌ Registration failed:", err.stack || err);

    // Check for multer error (like file size limit)
    if (err.name === "MulterError") {
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    }

    // Fallback
    res.status(500).json({
      error: err.message || "Server error during registration.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", req.body);

    const user = await Person.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "Username is incorrect." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password is incorrect." });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        firstTime: user.firstTime,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});


router.get('/get-profile', AuthMiddleWare, async (req, res) => {
  try {
    const user = await Person.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching profile.' });
  }
});

// PUT /update-profile/:id
router.put('/update-profile/:id', AuthMiddleWare, upload.single('avatar'), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized profile update attempt.' });
    }

    const { name, email, password } = req.body;
    const updates = {};

    if (name) updates.username = name;
    if (email) updates.email = email;
    if (password) updates.password = password; // Will be hashed by schema's pre-save hook
    if (req.file && req.file.path) {
      updates.profilePic = req.file.path;
    }

    let user = await Person.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    Object.assign(user, updates);
    await user.save(); // This triggers the pre-save hook for password hashing

    const updatedUser = await Person.findById(req.params.id).select('-password');
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Error updating profile.' });
  }
});

router.delete("/delete/:id", AuthMiddleWare, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const userId = req.params.id;

    if (req.user.id === userId) {
      return res.status(400).json({ error: "Admin cannot delete themselves." });
    }

    const deletedUser = await Person.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "User deleted successfully.",
      user: {
        username: deletedUser.username,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

const FRONTEND_URL = "https://cricbid.sytes.net"; // ⬅️ Replace with your actual frontend

// Utility to generate random password
function generateRandomPassword(length = 10) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

// Utility to generate random username (optional, can use name-based)
function generateUsername(name) {
  const suffix = Math.floor(Math.random() * 10000);
  return `${name.toLowerCase().replace(/\s+/g, "")}${suffix}`;
}

// Send email using nodemailer
async function sendTempAdminEmail({ email, username, password }) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // e.g., Gmail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Temp Admin Access | Your App",
    html: `
      <p>Hello,</p>
      <p>You have been added as a <strong>Temp Admin</strong>.</p>
      <p>Use the following credentials to log in:</p>
      <ul>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Click the link below to log in and set your own password:</p>
      <a href="${FRONTEND_URL}/login">Go to Website</a>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// 📌 Route to create temp-admin
router.post("/add-temp-admin", AuthMiddleWare, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admin can add temp-admins." });
    }

    const existing = await Person.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const username = generateUsername(name);
    const password = generateRandomPassword();
    const newTempAdmin = new Person({
      username,
      email,
      password,
      role: "temp-admin",
      firstTime: true,
    });

    await newTempAdmin.save();

    await sendTempAdminEmail({ email, username, password });

    res
      .status(201)
      .json({ message: "Temp-admin created and email sent successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add temp-admin." });
  }
});

router.post("/set-password", AuthMiddleWare, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }

    const user = await Person.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Optional: Only allow temp-admin to use this route
    if (user.role !== "temp-admin") {
      return res
        .status(403)
        .json({ error: "Only temp-admins can use this route." });
    }

    user.password = newPassword;
    user.firstTime = false; // Triggers the pre-save hash
    await user.save();

    res.status(200).json({
      message: "Password updated successfully. You can now log in normally.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to set password." });
  }
});

// router.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await Person.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ error: "No account with this email found." });
//     }

//     const token = crypto.randomBytes(32).toString("hex");

//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
//     await user.save();

//     const resetLink = `https://cricbid.sytes.net/reset-password/${token}`;

//     const transporter = nodemailer.createTransport({
//       service: "gmail", // or your email provider
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       to: user.email,
//       from: process.env.EMAIL_USER,
//       subject: "Reset your password",
//       html: `<p>Hello ${user.username},</p>
//         <p>You requested to reset your password. Click the link below to set a new password:</p>
//         <a href="${resetLink}">${resetLink}</a>
//         <p>This link is valid for 15 minutes.</p>`,
//     });

//     res.json({ message: "Password reset link sent to your email." });
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).json({ error: "Something went wrong. Please try again later." });
//   }
// });

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Person.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "No account with this email found." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetLink = `https://cricbid.sytes.net/reset-password/${token}`;

    // ✅ Use a plain-text format only
    const textMessage = `
Hi ${user.username},

We received a request to reset your password.

Click the link below to reset it (valid for 15 minutes):
${resetLink}

If you did not request this, you can ignore this email.

– CricBid Support Team
    `.trim();

    // ✅ Gmail SMTP (still fine for dev/testing)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CricBid Support" <${process.env.EMAIL_USER}>`, // ✅ Name + Email
      to: user.email,
      replyTo: process.env.EMAIL_USER,
      subject: "CricBid Password Reset Request",
      text: textMessage,
      headers: {
        "X-Priority": "1", // ✅ High priority
      },
    });

    return res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await Person.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Unable to reset password. Try again later." });
  }
});


module.exports = router;
