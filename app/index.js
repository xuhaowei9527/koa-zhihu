const Koa = require("koa");
const KoaBody = require("koa-body");
const KoaStatic = require("koa-static");
const error = require("koa-json-error");
const parameter = require("koa-parameter");
const mongoose = require("mongoose");
const path = require("path");
const app = new Koa();
const routing = require("./routes/index");
const { connectStr } = require("./config");

mongoose.connect(
  connectStr,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("连接成功")
);
mongoose.connection.on("error", console.error);

app.use(KoaStatic(path.join(__dirname, "public")));
app.use(
  error({
    postFormat: (e, { stack, ...rest }) =>
      process.env.NODE_ENV === "production" ? rest : { stack, ...rest }
  })
);

app.use(
  KoaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, "public/uploads"),
      keepExtensions: true // 保留扩展名
    }
  })
);
app.use(parameter(app));
routing(app);

app.listen(8080, () => console.log("程序运行在: 8080端口"));
