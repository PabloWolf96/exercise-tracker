const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});
ExerciseSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.date = ret.date.toDateString();
    return ret;
  },
});
module.exports = mongoose.model("Exercise", ExerciseSchema);
