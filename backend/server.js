require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const usersRoute = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();

    const db = client.db("smartcoursecompanion");

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

app.listen(process.env.PORT, () => {
  console.log("Server running");
});