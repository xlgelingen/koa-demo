require("dotenv").config();
const Koa = require("koa");
const koaBody = require("koa-body");
const cors = require("./middlewares/cors");
const response = require("./middlewares/response");
const auth = require("./middlewares/auth");
const router = require("./routes");
const app = new Koa();

app
  .use(koaBody({ multipart: true }))
  .use(cors.allowAll)
  .use(response)
  .use(auth.isAuth)
  .use(router.routes())
  .listen(8068);
