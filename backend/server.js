require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const usersRoute = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();

    const db = client.db("smartcoursecompanion");

    const usersCollection = db.collection("users");
    const demoUsers = [
      { email: "student@test.com", password: "1234", role: "student" },
      { email: "admin@test.com", password: "1234", role: "admin" },
    ];

    for (const demoUser of demoUsers) {
      const existingUser = await usersCollection.findOne({ email: demoUser.email });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(demoUser.password, 10);

        await usersCollection.insertOne({
          email: demoUser.email,
          password: hashedPassword,
          role: demoUser.role,
          courses: [],
          createdAt: new Date(),
        });
      }
    }

    // make db accessible in routes
    app.locals.db = db;

    console.log("MongoDB connected");

  } catch (err) {
    console.error(err);
  }
}

connectDB();

// Register routes
app.use("/api/users", usersRoute);

app.listen(process.env.PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${process.env.PORT}`);
});
