// 拿到用户模型
const Answer = require("../model/answers");

class AnswersCtl {
  async find(ctx) {
    const { per_page = 3 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1; // 页码
    const perPage = Math.max(per_page * 1, 1); // 页尺寸
    const q = new RegExp(ctx.query.q);
    // 匹配内容，questionId从路由上获取
    ctx.body = await Answer.find({
      content: q,
      questionId: ctx.params.questionId
    })
      .limit(perPage)
      .skip(perPage * page);
  }
  // 检查答案存在与否并且在相相应问题下面中间件
  async checkAnswerExist(ctx, next) {
    const answer = await Answer.findById(ctx.params.id);
    if (!answer) {
      ctx.throw(404, "答案不存在");
    }
    // 只有删改查答案才有此选项，赞、踩答案时不检查
    if (ctx.questionId && answer.questionId !== ctx.params.questionId) {
      ctx.throw(404, "该问题下没有此答案");
    }
    // 挂载到ctx.state上，供update使用
    ctx.state.answer = answer;
    await next();
  }
  async findById(ctx) {
    const { fields = "" } = ctx.query;
    const selectFields = fields
      .split(";")
      .filter(f => f)
      .map(f => " +" + f)
      .join();
    const answer = await Answer.findById(ctx.params.id)
      .select(selectFields)
      .populate("answerer");
    ctx.body = answer;
  }
  async create(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: true },
      answerer: { type: "string", required: false },
      questionId: { type: "string", required: false }
    });
    const answer = await new Answer({
      ...ctx.request.body,
      answerer: ctx.state.user._id,
      questionId: ctx.params.questionId
    }).save();
    ctx.body = answer;
  }
  async update(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: true },
      answerer: { type: "string", required: false },
      questionId: { type: "string", required: false }
    });
    await ctx.state.answer.update(ctx.request.body);
    ctx.body = ctx.state.answer;
  }
  async checkAnswerer(ctx, next) {
    const { answer } = ctx.state;
    if (answer.answerer.toString() !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }
  // 删除
  async del(ctx) {
    const answer = await Answer.findByIdAndRemove(ctx.params.id);
    ctx.body = answer;
  }
}

module.exports = new AnswersCtl();
