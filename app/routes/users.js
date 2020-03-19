const Router = require("koa-router");
const router = new Router({ prefix: "/users" });
const jwt = require("koa-jwt");
const { secret } = require("../config");
const {
  checkOwner,
  find,
  findById,
  create,
  update,
  del,
  login,
  listFollowing,
  listFollower,
  checkUserExist,
  follow,
  unfollow,
  listFollowingTopics,
  followingTopics,
  unfollowingTopics,
  likeAnswer,
  unlikeAnswer,
  listLikingAnswers,
  dislikeAnswer,
  undislikeAnswer,
  listdislikingAnswers,
  collectAnswer,
  uncollectAnswer,
  listCollectingAnswers
} = require("../controllers/users");
const { checkTopicExist } = require("../controllers/topics");
const { checkAnswerExist } = require("../controllers/answers");
// 认证中间件
const auth = jwt({ secret });

// 查询
router.get("/", find);
// 查询特定用户
router.get("/:id", auth, findById);

// 增加
router.post("/", create);

// 修改put整体更新patch部分更新
router.patch("/:id", auth, checkOwner, update);

// 删除
router.delete("/:id", auth, checkOwner, del);

// 登陆
router.post("/login", login);

// 获取关注列表
router.get("/:id/following", listFollowing);

// 获取粉丝列表
router.get("/:id/followers", listFollower);

// 关注
router.put("/following/:id", auth, checkUserExist, follow);

// 取消关注
router.delete("/unfollowing/:id", auth, checkUserExist, unfollow);

// 获取话题列表
router.get("/:id/listFollowingTopics", listFollowingTopics);

// 关注话题
router.put("/followingTopics/:id", auth, checkTopicExist, followingTopics);

// 取消关注话题
router.delete(
  "/unfollowingTopics/:id",
  auth,
  checkTopicExist,
  unfollowingTopics
);
// 获取赞列表
router.get("/:id/listLikingAnswers", listLikingAnswers);

// 赞
router.put(
  "/likingAnswer/:id",
  auth,
  checkAnswerExist,
  likeAnswer,
  undislikeAnswer
);

// 取消赞
router.delete("/unlikingAnswer/:id", auth, checkAnswerExist, unlikeAnswer);
// 获取踩列表
router.get("/:id/listdislikingAnswers", listdislikingAnswers);

// 踩
router.put(
  "/dislikeAnswer/:id",
  auth,
  checkAnswerExist,
  dislikeAnswer,
  unlikeAnswer
);

// 取消踩
router.delete("/undislikeAnswer/:id", auth, checkAnswerExist, undislikeAnswer);

// 获取收藏答案列表
router.get("/:id/collectingAnswers", listCollectingAnswers);

// 收藏答案
router.put("/collectingAnswers/:id", auth, checkAnswerExist, collectAnswer);

// 取消收藏答案
router.delete(
  "/collectingAnswers/:id",
  auth,
  checkAnswerExist,
  uncollectAnswer
);

module.exports = router;
