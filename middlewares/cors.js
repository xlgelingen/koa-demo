const cors = {
  allowAll: async function(ctx, next) {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Headers", "Authorization,Accept-Language,Accept,Content-Type");
    ctx.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    if (ctx.method === "OPTIONS") ctx.status = 204;
    else await next();
  },
};

module.exports = cors;
