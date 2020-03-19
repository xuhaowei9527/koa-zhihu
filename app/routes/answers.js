const Router = require("koa-router");
const router = new Router({ prefix: "/questions/:questionId/answers" });
const jwt = require("koa-jwt");
const { secret } = require("../config");
const {
  find,
  findById,
  create,
  update,
  del,
  checkAnswerer,
  checkAnswerExist
} = require("../controllers/answers");

// 认证中间件
const auth = jwt({ secret });

router.get("/", find);
router.post("/", auth, create);
router.get("/:id", auth, checkAnswerExist, findById);
router.patch("/:id", auth, checkAnswerExist, checkAnswerer, update);
router.delete("/:id", auth, checkAnswerExist, checkAnswerer, del);

module.exports = router;
