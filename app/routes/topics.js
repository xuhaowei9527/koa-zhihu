const Router = require("koa-router");
const router = new Router({ prefix: "/topics" });
const jwt = require("koa-jwt");
const { secret } = require("../config");
const {
  find,
  findById,
  create,
  update,
  listTopicFollower,
  checkTopicExist,
  listQuestions
} = require("../controllers/topics");

// 认证中间件
const auth = jwt({ secret });

// 查询
router.get("/", find);
// 查询特定用户
router.get("/:id", auth, checkTopicExist, findById);

// 增加
router.post("/", auth, create);

// 修改put整体更新patch部分更新
router.patch("/:id", auth, checkTopicExist, update);

// 获取关注话题的用户列表
router.get("/:id/topicFollowers", checkTopicExist, listTopicFollower);

// 获取话题的问题列表
router.get("/:id/questions", checkTopicExist, listQuestions);

module.exports = router;
