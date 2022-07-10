const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const connectToDB = require("./config/db");
connectToDB();
const User = require("./models/user");
const Exercise = require("./models/exercise");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json({ username: user.username, _id: user._id });
});
app.get("/api/users", async (req, res) => {
  const users = await User.find().select("-__v");
  res.json(users);
});
app.post("/api/users/:id/exercises", async (req, res) => {
  const { id } = req.params;
  let { description, duration, date } = req.body;
  date = date ? new Date(date) : new Date();
  if (!description || !duration) {
    res.status(400).json({ error: "missing required fields" });
  }
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  const exercise = new Exercise({
    userId: user._id,
    description,
    duration,
    date,
  });
  await exercise.save();
  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
  });
});
app.get("/api/users/:id/logs", async (req, res) => {
  const { id } = req.params;
  const limit = +req.query.limit || undefined;
  const { from, to } = req.query;
  // from and to are in the format of "YYYY-MM-DD"
  const match = /^\d{4}-\d{2}-\d{2}$/;
  if (from && !match.test(from)) {
    return res.status(400).json({ error: "invalid date format" });
  }
  if (to && !match.test(to)) {
    return res.status(400).json({ error: "invalid date format" });
  }
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  const query = Exercise.find({ userId: user._id });
  if (from) {
    query.where("date").gte(new Date(from));
  }
  if (to) {
    query.where("date").lte(new Date(to));
  }
  if (limit) {
    query.limit(limit);
  }
  const exercises = await query.select("-__v -_id -userId");
  res.json({
    _id: user._id,
    username: user.username,
    count: exercises.length,
    log: exercises,
  });
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
