const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const connectToDB = require("./config/db");
connectToDB();
const User = require("./models/user");

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
    res.status(404).json({ error: "user not found" });
  }
  user.log.push({ description, duration, date });
  await user.save();
  console.log(user.duration);
  res.json({
    username: user.username,
    _id: user._id,
    description,
    duration: +duration,
    date: date.toDateString(),
  });
});
app.get("/api/users/:id/logs", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-log._id -__v");
  if (!user) {
    res.status(404).json({ error: "user not found" });
  }
  res.json({ ...user._doc, count: user.log.length });
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
