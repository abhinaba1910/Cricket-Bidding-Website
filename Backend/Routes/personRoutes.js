const express = require("express");
const router = express.Router();
const Person = require("../Models/person");
const jwt = require("jsonwebtoken");
const AuthMiddleWare = require("../Auth/Authentication");
const multer = require("multer");
const { storage } = require("../Utils/cloudinary");
const upload = multer({ storage });

const JWT_SECRET = process.env.JWT_SECRET;
router.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUsername = await Person.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const existingEmail = await Person.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already registered." });
    }
    const profilePicUrl = req.file?.path || "";
    const person = new Person({
      username,
      email,
      password,
      role,
      profilePic: profilePicUrl,
    });
    await person.save();
    res.status(201).json({
      message: "User registered successfully!",
      user: {
        username,
        email,
        role: person.role,
        profilePic: person.profilePic
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Person.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});


router.get('/getInfo', AuthMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await Person.findById(userId).select('-password'); // exclude password

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      message: 'User fetched successfully.',
      user,
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});


router.delete('/delete/:id', AuthMiddleWare, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const userId = req.params.id;

    if (req.user.id === userId) {
      return res.status(400).json({ error: 'Admin cannot delete themselves.' });
    }

    const deletedUser = await Person.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      message: 'User deleted successfully.',
      user: {
        username: deletedUser.username,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

module.exports = router;
