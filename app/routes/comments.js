const Router = require("koa-router");
const router = new Router({
  prefix: "/questions/:questionId/answers/:answerId/comments"
});
const jwt = require("koa-jwt");
const { secret } = require("../config");
const {
  find,
  findById,
  create,
  update,
  del,
  checkCommentator,
  checkCommentExist
} = require("../controllers/comments");

// 认证中间件
const auth = jwt({ secret });

router.get("/", find);
router.post("/", auth, create);
router.get("/:id", auth, checkCommentExist, findById);
router.patch("/:id", auth, checkCommentExist, checkCommentator, update);
router.delete("/:id", auth, checkCommentExist, checkCommentator, del);

module.exports = router;
