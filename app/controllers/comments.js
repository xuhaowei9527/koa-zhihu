// 拿到用户模型
const Comment = require("../model/comments");

class CommentsCtl {
  async find(ctx) {
    const { per_page = 3 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1; // 页码
    const perPage = Math.max(per_page * 1, 1); // 页尺寸
    const q = new RegExp(ctx.query.q);
    const { questionId, answerId } = ctx.params;
    const { rootCommentId } = ctx.query;
    // 匹配内容，questionId从路由上获取
    ctx.body = await Comment.find({
      content: q,
      questionId,
      answerId,
      rootCommentId
    })
      .limit(perPage)
      .skip(perPage * page)
      .populate("commentator replyTo");
  }
  // 检查答案存在与否并且在相相应问题下面中间件
  async checkCommentExist(ctx, next) {
    const comment = await Comment.findById(ctx.params.id);
    if (!comment) {
      ctx.throw(404, "评论不存在");
    }
    // 只有删改查答案才有此选项，赞、踩答案时不检查
    if (ctx.questionId && comment.questionId !== ctx.params.questionId) {
      ctx.throw(404, "该问题下没有此评论");
    }
    if (ctx.answerId && comment.answerId !== ctx.params.answerId) {
      ctx.throw(404, "该答案下没有此评论");
    }
    // 挂载到ctx.state上，供update使用
    ctx.state.comment = comment;
    await next();
  }
  async findById(ctx) {
    const { fields = "" } = ctx.query;
    const selectFields = fields
      .split(";")
      .filter(f => f)
      .map(f => " +" + f)
      .join();
    const comment = await Comment.findById(ctx.params.id)
      .select(selectFields)
      .populate("commentator");
    ctx.body = comment;
  }
  async create(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: true },
      rootCommentId: { type: "string", required: false },
      replyTo: { type: "string", required: false }
    });
    const comment = await new Comment({
      ...ctx.request.body,
      commentator: ctx.state.user._id,
      questionId: ctx.params.questionId,
      answerId: ctx.params.answerId
    }).save();
    ctx.body = comment;
  }
  async update(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: true }
    });
    const { content } = ctx.request.body;
    await ctx.state.comment.update({ content });
    ctx.body = ctx.state.comment;
  }
  async checkCommentator(ctx, next) {
    const { comment } = ctx.state;
    if (comment.commentator.toString() !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }
  // 删除
  async del(ctx) {
    const comment = await Comment.findByIdAndRemove(ctx.params.id);
    ctx.body = comment;
  }
}

module.exports = new CommentsCtl();
