// 拿到用户模型
const User = require("../model/users");
const Question = require("../model/questions");
const Answer = require("../model/answers");
const jsonwebtoken = require("jsonwebtoken");
const { secret } = require("../config");

class UsersCtl {
  // 授权
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, "无权操作");
    }
    await next();
  }
  async find(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1; // 页码
    const perPage = Math.max(per_page * 1, 1); // 页尺寸
    ctx.body = await User.find({ name: new RegExp(ctx.query.q) })
      .limit(perPage)
      .skip(perPage * page);
  }
  async findById(ctx) {
    const { fields } = ctx.query;
    const selectFields = fields
      .split(";")
      .filter(f => f)
      .map(f => " +" + f)
      .join("");
    const populateStr = fields
      .split(";")
      .filter(f => f)
      .map(f => {
        if (f === "employments") {
          return "employments.company employments.major";
        } else if (f === "educatoins") {
          return "educations.school educations.major";
        }
        return f;
      })
      .join(" ");
    const user = await User.findById(ctx.params.id)
      .select(selectFields)
      .populate(populateStr);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user;
  }
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true }
    });
    const { name } = ctx.request.body;
    const repeateduser = await User.findOne({ name });
    if (repeateduser) {
      ctx.throw(409, "用户已经存在");
    }
    const user = await new User(ctx.request.body).save();
    ctx.body = user;
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      password: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      gender: { type: "string", required: false },
      headline: { type: "string", required: false },
      locations: { type: "array", itemType: "string", required: false },
      business: { type: "string", required: false },
      employments: { type: "array", itemType: "object", required: false },
      educations: { type: "array", itemType: "object", required: false }
    });
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user;
  }
  async del(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.status = 204;
  }
  async login(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true }
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) {
      ctx.throw(401, "用户名或密码错误");
    }
    const { _id, name } = user;
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: "1d" });
    ctx.body = { token };
  }

  // 关注列表
  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+following")
      .populate("following");
    if (!user) {
      ctx.throw(404, 用户不存在);
    }
    ctx.body = user.following;
  }

  // 粉丝列表
  async listFollower(ctx) {
    const users = await User.find({ following: ctx.params.id });
    ctx.body = users;
  }
  // 检查用户存在与否中间件
  async checkUserExist(ctx, next) {
    const user = User.findById(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    await next();
  }
  // 关注
  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+following");
    if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
  }

  // 取消关注
  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+following");
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.following.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }

  // 关注话题
  async followingTopics(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      "+followingTopics"
    );
    if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      me.followingTopics.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
  }

  // 取消关注话题
  async unfollowingTopics(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      "+followingTopics"
    );
    const index = me.followingTopics
      .map(id => id.toString())
      .indexOf(ctx.params.id);
    if (index > -1) {
      me.followingTopics.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
  // 获取关注的话题列表
  async listFollowingTopics(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+followingTopics")
      .populate("followingTopics");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.followingTopics;
  }
  // 查询用户问题列表
  async listQuestions(ctx) {
    const questions = await Question.find({ questioner: ctx.params.id });
    ctx.body = questions;
  }
  // 赞
  async likeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select("+likingAnswers");
    if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id);
      me.save();
      // 赞数加1
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } });
    }
    ctx.status = 204;
    await next();
  }

  // 取消赞
  async unlikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+likingAnswers");
    const index = me.likingAnswers
      .map(id => id.toString())
      .indexOf(ctx.params.id);
    if (index > -1) {
      me.likingAnswers.splice(index, 1);
      me.save();
      // 赞数加1
      await Answer.findByIdAndUpdate(ctx.params.id, {
        $inc: { voteCount: -1 }
      });
    }
    ctx.status = 204;
  }
  // 获取用户赞过的答案列表
  async listLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+likingAnswers")
      .populate("likingAnswers");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.likingAnswers;
  }
  // 踩
  async dislikeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select("+disAnswers");
    if (!me.disAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      me.disAnswers.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
    await next();
  }

  // 取消踩
  async undislikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+disAnswers");
    const index = me.disAnswers.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.disAnswers.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
  // 获取用户踩过的答案列表
  async listdislikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+disAnswers")
      .populate("disAnswers");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.disAnswers;
  }
  // 收藏答案
  async collectAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select(
      "+collectingAnswers"
    );
    if (
      !me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)
    ) {
      me.collectingAnswers.push(ctx.params.id);
      me.save();
    }
    ctx.status = 204;
    await next();
  }

  // 取消收藏答案
  async uncollectAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      "+collectingAnswers"
    );
    const index = me.collectingAnswers
      .map(id => id.toString())
      .indexOf(ctx.params.id);
    if (index > -1) {
      me.collectingAnswers.splice(index, 1);
      me.save();
    }
    ctx.status = 204;
  }
  // 获取用户收藏的答案列表
  async listCollectingAnswers(ctx) {
    const user = await User.findById(ctx.params.id)
      .select("+collectingAnswers")
      .populate("collectingAnswers");
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user.collectingAnswers;
  }
}

module.exports = new UsersCtl();
