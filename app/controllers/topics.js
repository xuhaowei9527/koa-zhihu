// 拿到用户模型
const Topic = require("../model/topics");
const User = require("../model/users");
const Question = require("../model/questions");

class TopicsCtl {
  async find(ctx) {
    const { per_page = 3 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1; // 页码
    const perPage = Math.max(per_page * 1, 1); // 页尺寸
    ctx.body = await Topic.find({ name: new RegExp(ctx.query.q) })
      .limit(perPage)
      .skip(perPage * page);
  }
  // 检查话题存在与否中间件
  async checkTopicExist(ctx, next) {
    const topic = Topic.findById(ctx.params.id);
    if (!topic) {
      ctx.throw(404, "话题不存在");
    }
    await next();
  }
  async findById(ctx) {
    const { fields } = ctx.query;
    const selectFields = fields
      .split(";")
      .filter(f => f)
      .map(f => " +" + f)
      .join();
    const topic = await Topic.findById(ctx.params.id).select(selectFields);
    ctx.body = topic;
  }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false }
    });
    const topic = await new Topic(ctx.request.body).save();
    ctx.body = topic;
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false }
    });
    const topic = await Topic.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    ctx.body = topic;
  }
  // 关注话题的用户列表
  async listTopicFollower(ctx) {
    const users = await User.find({ followingTopics: ctx.params.id });
    ctx.body = users;
  }
  // 获取话题的问题列表
  async listQuestions(ctx) {
    const questions = await Question.find({ topics: ctx.params.id });
    ctx.body = questions;
  }
}

module.exports = new TopicsCtl();
