const JWT = require("jsonwebtoken");
const configs = require("../config");
const Users = require("../models/users");
const SMSCode = require("../models/sms_code");
const AdmissionsApps = require("../models/admission_apps");
const { scrypt } = require("../utils/crypto");
const { nanoid } = require("../utils/nanoid");
const { stringify } = require("../utils/tool");
const { randomString } = require("../utils/random");

const authController = {
  login: async (ctx) => {
    const { type, account_number, password, phone_number, verification_code } =
      ctx.request.body;
    if (type === "VERIFYCODE") {
      if (!phone_number || !verification_code) {
        ctx.state.code = 0;
        ctx.state.data.message = "手机号和验证码不能为空";
        return;
      }
      const [res1, res2] = await Promise.all([
        SMSCode.first("id", "code", "min", "status", "created_at")
          .where({
            phone_number,
          })
          .orderBy("id", "desc"),
        Users.first("id", "name", "role").where({
          phone_number,
          is_disabled: 0,
          deleted_at: null,
        }),
      ]);
      if (!res1) {
        ctx.state.code = 0;
        ctx.state.data.message = "该手机号尚未发送验证码";
        return;
      }
      if (res1.status === 1) {
        ctx.state.code = 0;
        ctx.state.data.message = "该验证码已被使用";
        return;
      }
      if (Date.now() > new Date(res1.created_at).getTime() + res1.min * 60000) {
        ctx.state.code = 0;
        ctx.state.data.message = "该验证码已失效";
        return;
      }
      if (res1.code !== verification_code) {
        ctx.state.code = 0;
        ctx.state.data.message = "该验证码不正确";
        return;
      }
      await SMSCode.update(res1.id, { status: 1, updated_at: new Date() });
      if (!res2) {
        ctx.state.code = 0;
        ctx.state.data.message = "用户不存在";
        return;
      }
      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
      const token = JWT.sign(
        {
          exp,
          user: {
            id: res2.id,
            name: res2.name,
            role: res2.role,
          },
        },
        configs.JWT_SECRET
      );
      await Users.knex()
        .where({ phone_number, is_disabled: 0, deleted_at: null })
        .update({ token, last_login_at: new Date() });
      ctx.state.code = 200;
      ctx.state.data = { token, expire: 60 * 60 * 24 * 7 };
    } else {
      if (!account_number || !password) {
        ctx.state.code = 0;
        ctx.state.data.message = "账号或密码不能为空";
        return;
      }
      let passwordHash = "";
      passwordHash = await scrypt(password);
      const users = await Users.select("id");
      if (users.length === 0) {
        await Users.insert({
          name: "",
          account_number,
          phone_number: "",
          email: "",
          password: passwordHash,
          role: 1,
          created_at: new Date(),
        });
      }
      const user = await Users.first("id", "name", "password", "role").where({
        account_number,
        is_disabled: 0,
        deleted_at: null,
      });
      if (!user) {
        ctx.state.code = 0;
        ctx.state.data.message = "用户不存在";
        return;
      }
      if (passwordHash !== user.password) {
        ctx.state.code = 0;
        ctx.state.data.message = "密码错误";
        return;
      }
      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
      const token = JWT.sign(
        {
          exp,
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        },
        configs.JWT_SECRET
      );
      await Users.knex()
        .where({ account_number, is_disabled: 0, deleted_at: null })
        .update({ token, last_login_at: new Date() });
      ctx.state.code = 200;
      ctx.state.data = { token, expire: 60 * 60 * 24 * 7 };
    }
  },
  signup: async (ctx) => {
    const {
      reg_type,
      account_number,
      phone_number,
      verification_code,
      password,
      confirm_password,
    } = ctx.request.body;
    if (
      !reg_type ||
      !account_number ||
      !phone_number ||
      !verification_code ||
      !password ||
      !confirm_password
    ) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const [res1, res2, res3] = await Promise.all([
      Users.first("id").where({ account_number }),
      Users.first("id").where({ phone_number }),
      SMSCode.first("id", "code", "min", "status", "created_at")
        .where({ phone_number })
        .orderBy("id", "desc"),
    ]);
    if (res1) {
      ctx.state.code = 0;
      ctx.state.data.message = "该账号已注册";
      return;
    }
    if (res2) {
      ctx.state.code = 0;
      ctx.state.data.message = "该手机号已注册";
      return;
    }
    if (!res3) {
      ctx.state.code = 0;
      ctx.state.data.message = "该手机号尚未发送验证码";
      return;
    }
    if (res3.status === 1) {
      ctx.state.code = 0;
      ctx.state.data.message = "该验证码已被使用";
      return;
    }
    if (Date.now() > new Date(res3.created_at).getTime() + res3.min * 60000) {
      ctx.state.code = 0;
      ctx.state.data.message = "该验证码已失效";
      return;
    }
    if (res3.code !== verification_code) {
      ctx.state.code = 0;
      ctx.state.data.message = "该验证码不正确";
      return;
    }
    if (password !== confirm_password) {
      ctx.state.code = 0;
      ctx.state.data.message = "两次输入的密码不一致";
      return;
    }

    const passwordHash = await scrypt(password);
    const params = {
      account_number,
      phone_number,
      password: passwordHash,
      role: 2,
      reg_type,
      source: 2,
      created_at: new Date(),
    };
    const ids = await Users.insert(params);

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const token = JWT.sign(
      {
        exp,
        user: {
          id: ids[0],
          name: "",
          role: 2,
        },
      },
      configs.JWT_SECRET
    );
    await Users.knex()
      .where({ account_number, is_disabled: 0, deleted_at: null })
      .update({ token, last_login_at: new Date() });
    await SMSCode.update(res3.id, { status: 1, updated_at: new Date() });

    ctx.state.code = 200;
    ctx.state.data = { token, expire: 60 * 60 * 24 * 7 };
  },
  admission: async (ctx) => {
    // key 暂时写死，后期由后台管理做配置
    const key = "key202404";
    const {
      name,
      gender,
      birthdate,
      email,
      phone_number,
      verification_code,
      school,
      faculty,
      major,
      grade,
      cls,
      research_exp,
      type,
      utm_params = {},
      custom_params = {},
    } = ctx.request.body;
    if (!name || !phone_number || !type) {
      ctx.state.code = 0;
      ctx.state.data.message = "姓名、手机号、类型均不能为空";
      return;
    }

    const [res1, res2, res3] = await Promise.all([
      AdmissionsApps.first("id").where({ key, phone_number }),
      Users.first("id").where({ phone_number }),
      SMSCode.first("id", "code", "min", "status", "created_at")
        .where({ phone_number })
        .orderBy("id", "desc"),
    ]);
    if (res1) {
      ctx.state.code = 0;
      ctx.state.data.message = "该手机号已提交报名，请勿重新提交";
      return;
    }
    if (!res3) {
      ctx.state.code = 0;
      ctx.state.data.message = "该手机号尚未发送验证码";
      return;
    }
    if (res3.status === 1) {
      ctx.state.code = 0;
      ctx.state.data.message = "该验证码已被使用";
      return;
    }
    if (Date.now() > new Date(res3.created_at).getTime() + res3.min * 60000) {
      ctx.state.code = 0;
      ctx.state.data.message = "该验证码已失效";
      return;
    }
    if (res3.code !== verification_code) {
      ctx.state.code = 0;
      ctx.state.data.message = "该验证码不正确";
      return;
    }

    let user_id = 0;
    if (res2) user_id = res2.id;
    else {
      const password = await scrypt(randomString(8));
      const ids = await Users.insert({
        name,
        account_number: randomString(8),
        phone_number,
        email,
        password,
        role: 2,
        reg_type: 1,
        source: 2,
        created_at: new Date(),
      });
      user_id = ids[0];
    }
    await AdmissionsApps.insert({
      uuid: nanoid(8),
      key,
      name,
      gender,
      birthdate,
      email,
      phone_number,
      school,
      faculty,
      major,
      grade,
      cls,
      research_exp,
      type,
      utm_params: stringify(utm_params),
      custom_params: stringify(custom_params),
      user_id,
      created_at: new Date(),
    });
    await SMSCode.update(res3.id, { status: 1, updated_at: new Date() });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
};

module.exports = authController;
