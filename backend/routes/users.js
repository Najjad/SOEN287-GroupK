const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

//
// REGISTER USER
//
router.post("/register", async (req, res) => {
  try {

    const db = req.app.locals.db;

    const {
      role,
      email,
      password
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    // Check if email already exists
    const existingUser = await db
      .collection("users")
      .findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create user object
    const newUser = {
      role: role || "student",
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    const result = await db
      .collection("users")
      .insertOne(newUser);

    res.status(201).json({
      message: "User created",
      userId: result.insertedId
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

  }
});


//
// LOGIN USER
//
router.post("/login", async (req, res) => {
  try {

    const db = req.app.locals.db;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Missing email or password"
      });
    }

    const user = await db
      .collection("users")
      .findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    res.json({
      message: "Login successful",
      userId: user._id,
      email: user.email,
      role: user.role
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

  }
});

//
// GET USER BY EMAIL
//
router.get("/getByEmail/:email", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Optionally, exclude password from response
    const { password, ...userData } = user;

    res.json(userData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;