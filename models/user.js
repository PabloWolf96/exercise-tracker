const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  log: [
    {
      description: String,
      duration: Number,
      date: Date,
    },
  ],
});
// serialize date to string
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.log = ret.log.map((l) => {
      return { ...l, date: l.date.toDateString() };
    });
    ret.count = ret.log.length;
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);
