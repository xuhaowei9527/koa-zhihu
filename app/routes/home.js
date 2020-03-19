const Router = require("koa-router");
const router = new Router();
const { index, upload, dragupload } = require("../controllers/home");

router.get("/", index);
router.post("/upload", upload);
router.post("/dragupload", dragupload);
module.exports = router;
