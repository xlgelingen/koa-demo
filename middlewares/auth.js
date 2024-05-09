const JWT = require("jsonwebtoken");
const configs = require("../config");
const Users = require("../models/users");
const Roles = require("../models/roles");

const auth = {
  isAuth: async function (ctx, next) {
    await auth.isLogin(ctx, next);
  },
  isLogin: async function (ctx, next) {
    if (
      ctx.url === "/api/auth/login" ||
      ctx.url === "/api/auth/signup" ||
      ctx.url === "/api/auth/admission" ||
      ctx.url === "/api/auth/sms-code"
    ) {
      await next();
      return;
    }

    const token = ctx.headers.authorization
      ? ctx.headers.authorization.split(" ")[1]
      : "";
    if (!token) {
      ctx.state.code = 401;
      ctx.state.data.message = "没有登录";
      return;
    }
    let userInfo;
    JWT.verify(token, configs.JWT_SECRET, function (err, decoded) {
      if (err) userInfo = false;
      else userInfo = (decoded || {}).user;
    });
    if (!userInfo) {
      ctx.state.code = 401;
      ctx.state.data.message = "登录 token 过期";
      return;
    }
    ctx.state.userInfo = userInfo;
    await next();
  },
  permission: async function (ctx, next, p) {
    const user = await Users.first("role").where({
      id: ctx.state.userInfo.id,
      is_disabled: 0,
      deleted_at: null,
    });
    if (!user) {
      ctx.status = 403;
      ctx.state.code = -3;
      ctx.state.data.message = "用户不存在";
      return;
    }
    const role = await Roles.first("id", "permissions").where({
      id: user.role,
    });
    if (!role) {
      ctx.status = 403;
      ctx.state.code = -3;
      ctx.state.data.message = "没有权限";
      return;
    }
    if (role.id === 1) (ctx.state.p = p), await next();
    else {
      if (!role.permissions || !role.permissions.includes(p)) {
        ctx.status = 403;
        ctx.state.code = -3;
        ctx.state.data.message = "没有权限";
        return;
      }
      ctx.state.p = p;
      await next();
    }
  },
};

module.exports = auth;
