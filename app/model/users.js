const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  __v: { type: Number, select: false },
  name: { type: String, required: true },
  password: { type: String, required: true, select: false },
  avatar_url: { type: String },
  business: { type: Schema.Types.ObjectId, ref: "Topic" },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
    required: true,
    select: false
  }, // 可枚举
  headline: { type: String },
  locations: {
    type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    select: false
  },
  employments: {
    type: [
      {
        company: { type: Schema.Types.ObjectId, ref: "Topic" },
        job: { type: Schema.Types.ObjectId, ref: "Topic" }
      }
    ],
    select: false
  },
  educations: {
    type: [
      {
        school: { type: String },
        major: { type: String }, //专业
        diploma: { type: Number, enum: [1, 2, 3, 4, 5] }, // 学历
        entrance_year: { type: Number }, //入学年份
        graduation_year: { type: Number } //毕业年份
      }
    ],
    select: false
  },
  following: {
    // 与用户相关联
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    select: false
  },
  followingTopics: {
    // 与用户相关联
    type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    select: false
  },
  likingAnswers: {
    // 赞过的答案
    type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    select: false
  },
  disAnswers: {
    // 踩过的答案
    type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    select: false
  },
  collectingAnswers: {
    // 收藏的答案
    type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    select: false
  }
});

module.exports = model("User", userSchema);
