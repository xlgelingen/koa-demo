const Users = require("../models/users");
const Roles = require("../models/roles");
const Enums = require("../models/enums");
const COS = require("../models/cos");
const { scrypt } = require("../utils/crypto");
const { formatTime } = require("../utils/date");

const userController = {
  self: async (ctx) => {
    const res = await Users.first(
      "id",
      "name",
      "avatar_id",
      "account_number",
      "phone_number",
      "email",
      "role"
    ).where({ id: ctx.state.userInfo.id });
    const role = await Roles.first("platforms", "permissions").where({
      id: res.role,
      deleted_at: null,
    });
    res.permissions = role.permissions;
    res.platforms = role.platforms;
    const avatar = await COS.first("url").where({ id: res.avatar_id });
    res.avatar_url = avatar?.url ?? "";
    delete res.avatar_id;
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  commonUpdatePassword: async (ctx) => {
    const id = ctx.state.userInfo.id;
    const { old_password, new_password } = ctx.request.body;
    if (!old_password || !new_password) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const regexp =
      /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{6,30}$/;
    if (!regexp.test(new_password)) {
      ctx.state.code = 0;
      ctx.state.data.message =
        "新密码至少包含大写字母、小写字母、数字、特殊符号(~!@#$%^&*()_.,)中的三种，且长度应在 6 到 30 位数之间";
      return;
    }
    if (old_password === new_password) {
      ctx.state.code = 0;
      ctx.state.data.message = "新密码不能与当前密码相同";
      return;
    }
    const res = await Users.first("password").where({ id });
    if (!res) {
      ctx.state.code = 0;
      ctx.state.data.message = "该用户不存在";
      return;
    }
    const passwordHash = await scrypt(old_password);
    if (passwordHash !== res.password) {
      ctx.state.code = 0;
      ctx.state.data.message = "密码错误";
      return;
    }
    const password = await scrypt(new_password);
    await Users.update(id, {
      password,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminAll: async (ctx) => {
    const type = ctx.request.query.type;
    const params = { is_disabled: 0, deleted_at: null };
    if (type) params.type = Number(type);
    const users = await Users.select("id", "name", "account_number").where(
      params
    );
    const list = users.map(({ id, name, account_number }) => ({
      id,
      name: name || account_number,
    }));
    ctx.state.code = 200;
    ctx.state.data = list;
  },
  adminIndex: async (ctx) => {
    const {
      page = 1,
      page_size = 20,
      search = "",
      role,
      type,
      is_disabled,
    } = ctx.request.query;
    const params = {};
    if (role) params.role = Number(role);
    if (type) params.type = Number(type);
    if (is_disabled) params.is_disabled = Number(is_disabled);
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    const totalRes = await Users.count()
      .where(params)
      .andWhere("account_number", "like", `%${search}%`);
    const total = totalRes.count;
    const res = await Users.select()
      .where(params)
      .andWhere("account_number", "like", `%${search}%`)
      .orderBy("id", "desc")
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);
    for (const item of res) {
      if (item.last_login_at)
        item.last_login_at = formatTime(item.last_login_at);
      if (item.updated_at) item.updated_at = formatTime(item.updated_at);
      item.created_at = formatTime(item.created_at);
      const [role, typeRes] = await Promise.all([
        Roles.first("id", "name").where({ id: item.role }),
        Enums.first("label").where({ type: "user_type", value: item.type }),
      ]);
      item.role = role;
      item.type_label = typeRes?.label || "";
      delete item.password;
      delete item.token;
    }
    ctx.state.code = 200;
    ctx.state.data.list = res;
    ctx.state.data.pagination = {
      current_page: currentPage,
      per_page: pageSize,
      total,
    };
  },
  adminInsert: async (ctx) => {
    const {
      name,
      account_number,
      phone_number,
      email,
      password = "",
      role = 0,
      type,
    } = ctx.request.body;
    if (!account_number || !password) {
      ctx.state.code = 0;
      ctx.state.data.message = "账号和密码不能为空";
      return;
    }
    const [res1, res2] = await Promise.all([
      Users.first("id").where({ account_number }),
      Users.first("id").where({ phone_number }),
    ]);
    if (res1) {
      ctx.state.code = 0;
      ctx.state.data.message = "该账号已存在";
      return;
    }
    if (phone_number && res2) {
      ctx.state.code = 0;
      ctx.state.data.message = "该手机号已存在";
      return;
    }
    const passwordHash = await scrypt(password);
    const params = {
      name,
      account_number,
      phone_number,
      email,
      password: passwordHash,
      role,
      type,
      created_at: new Date(),
    };
    await Users.insert(params);
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminUpdate: async (ctx) => {
    const id = ctx.params.id;
    const {
      name,
      account_number,
      phone_number,
      email,
      role = 0,
      type,
    } = ctx.request.body;
    if (!account_number) {
      ctx.state.code = 0;
      ctx.state.data.message = "账号不能为空";
      return;
    }
    const [res1, res2] = await Promise.all([
      Users.first("id").where({ account_number }),
      Users.first("id").where({ phone_number }),
    ]);
    if (res1 && res1.id != id) {
      ctx.state.code = 0;
      ctx.state.data.message = "该账号已存在";
      return;
    }
    if (phone_number && res2 && res2.id != id) {
      ctx.state.code = 0;
      ctx.state.data.message = "该手机号已存在";
      return;
    }
    const params = {
      name,
      account_number,
      phone_number,
      email,
      role,
      type,
      updated_at: new Date(),
    };
    await Users.update(id, params);
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDisabled: async (ctx) => {
    const id = ctx.params.id;
    const is_disabled = Number(ctx.request.query.disable);
    if (is_disabled !== 0 && is_disabled !== 1) {
      ctx.state.code = 0;
      ctx.state.data.message = "非法取值";
      return;
    }
    await Users.update(id, { is_disabled });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },

  myShowInfo: async (ctx) => {
    const res = await Users.first(
      "id",
      "name",
      "avatar_id",
      "account_number",
      "phone_number",
      "email",
      "address"
    ).where({ id: ctx.state.userInfo.id });
    const avatar = await COS.first("id", "name", "url").where({
      id: res.avatar_id,
    });
    res.avatar = avatar;
    delete res.avatar_id;
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  myUpdateInfo: async (ctx) => {
    const id = ctx.state.userInfo.id;
    const { avatar_id, account_number, name, phone_number, email, address } =
      ctx.request.body;
    if (!account_number) {
      ctx.state.code = 0;
      ctx.state.data.message = "账号不能为空";
      return;
    }
    const [res1, res2] = await Promise.all([
      Users.first("id").where({ account_number }),
      Users.first("id").where({ phone_number }),
    ]);
    if (res1 && res1.id != id) {
      ctx.state.code = 0;
      ctx.state.data.message = "该账号已存在";
      return;
    }
    if (res2 && res2.id != id) {
      ctx.state.code = 0;
      ctx.state.data.message = "该手机号已存在";
      return;
    }
    const params = {
      avatar_id,
      name,
      account_number,
      phone_number,
      email,
      address,
      updated_at: new Date(),
    };
    await Users.update(id, params);
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
};

module.exports = userController;
