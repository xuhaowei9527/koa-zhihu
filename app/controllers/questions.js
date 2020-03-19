// 拿到用户模型
const Question = require("../model//questions");

class QuestionsCtl {
  async find(ctx) {
    const { per_page = 3 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1; // 页码
    const perPage = Math.max(per_page * 1, 1); // 页尺寸
    const q = new RegExp(ctx.query.q);
    ctx.body = await Question.find({ $or: [{ title: q }, { description: q }] })
      .limit(perPage)
      .skip(perPage * page);
  }
  // 检查问题存在与否中间件
  async checkQuestionExist(ctx, next) {
    const question = await Question.findById(ctx.params.id);
    if (!question) {
      ctx.throw(404, "问题不存在");
    }
    // 挂载到ctx.state上，供update使用
    ctx.state.question = question;
    await next();
  }
  async findById(ctx) {
    const { fields = "" } = ctx.query;
    const selectFields = fields
      .split(";")
      .filter(f => f)
      .map(f => " +" + f)
      .join();
    const question = await Question.findById(ctx.params.id)
      .select(selectFields)
      .populate("questioner topics");
    ctx.body = question;
  }
  async create(ctx) {
    ctx.verifyParams({
      title: { type: "string", required: true },
      description: { type: "string", required: false }
    });
    const question = await new Question({
      ...ctx.request.body,
      questioner: ctx.state.user._id
    }).save();
    ctx.body = question;
  }
  async update(ctx) {
    ctx.verifyParams({
      title: { type: "string", required: false },
      description: { type: "string", required: false }
    });
    await ctx.state.question.update(ctx.request.body);
    ctx.body = ctx.state.question;
  }
  async checkQuestioner(ctx, next) {
    const { question } = ctx.state;
    if (question.questioner.toString() !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }
  // 删除
  async del(ctx) {
    const question = await Question.findByIdAndRemove(ctx.params.id);
    ctx.body = question;
  }
}

module.exports = new QuestionsCtl();
