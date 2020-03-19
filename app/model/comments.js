const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    __v: { type: Number, select: false },
    content: { type: String, required: true },
    commentator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: true
    },
    questionId: { type: String, required: true },
    answerId: { type: String, required: true },
    // 根评论
    rootCommentId: { type: String },
    // 评论给哪个用户
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = model("Comment", commentSchema);
