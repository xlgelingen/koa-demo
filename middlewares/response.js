const debug = require("debug")("koa-app");

module.exports = async function (ctx, next) {
  try {
    ctx.state.code = 0;
    ctx.state.data = {};
    await next();
    ctx.body = ctx.body
      ? ctx.body
      : {
          code: ctx.state.code,
          data: ctx.state.data,
        };
  } catch (e) {
    debug("Catch Error: %o", e);
    ctx.status = 500;
    ctx.body = {
      code: -1,
      error: e && e.message ? e.message : e.toString(),
    };
  }
};
