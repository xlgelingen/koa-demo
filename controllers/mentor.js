const Mentors = require("../models/mentors");
const Enums = require("../models/enums");
const User = require("../models/users");
const COS = require("../models/cos");
const { nanoid } = require("../utils/nanoid");
const { stringify } = require("../utils/tool");
const { formatTime } = require("../utils/date");

const mentorController = {
  adminAll: async (ctx) => {
    const type = ctx.request.query.type;
    let r = null;
    if (type)
      r = await Mentors.select("id", "name")
        .where({ deleted_at: null })
        .whereJsonObject("types", [Number(type)]);
    else r = await Mentors.select("id", "name").where({ deleted_at: null });
    ctx.state.code = 200;
    ctx.state.data = r;
  },
  adminIndex: async (ctx) => {
    const { page = 1, page_size = 20, search = "" } = ctx.request.query;
    const params = { deleted_at: null };
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    const andWhereParams = function () {
      this.where("uuid", "like", `%${search}%`)
        .orWhere("name", "like", `%${search}%`)
        .orWhere("title", "like", `%${search}%`)
        .orWhere("tag", "like", `%${search}%`);
    };
    const totalRes = await Mentors.count()
      .where(params)
      .andWhere(andWhereParams);
    const total = totalRes.count;
    const res = await Mentors.select()
      .where(params)
      .andWhere(andWhereParams)
      .orderBy("id", "desc")
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);
    for (const item of res) {
      item.created_at = formatTime(item.created_at);
      if (item.updated_at) item.updated_at = formatTime(item.updated_at);
      const [avatar, user, creator, editor, types] = await Promise.all([
        COS.first("id", "name", "url").where({ id: item.avatar_id }),
        User.first("id", "name").where({ id: item.user_id }),
        User.first("id", "name").where({ id: item.creator_id }),
        User.first("id", "name").where({ id: item.editor_id }),
        Enums.select("label", "value").where({ type: "mentor_type" }),
      ]);
      const typeObj = {};
      for (const t of types) {
        typeObj[t.value] = t.label;
      }
      item.avatar = avatar;
      item.user = user;
      item.creator = creator;
      item.editor = editor;
      item.types = item.types.map((i) => ({ value: i, label: typeObj[i] }));
      delete item.avatar_id;
      delete item.user_id;
      delete item.creator_id;
      delete item.editor_id;
      delete item.deleted_at;
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
      avatar_id,
      description,
      intro,
      homepage,
      title,
      tag,
      types = [],
      user_id,
    } = ctx.request.body;
    if (!name) {
      ctx.state.code = 0;
      ctx.state.data.message = "导师名称不能为空";
      return;
    }
    await Mentors.insert({
      uuid: nanoid(8),
      name,
      avatar_id,
      description,
      intro,
      homepage,
      title,
      tag,
      types: stringify(types),
      user_id,
      creator_id: ctx.state.userInfo.id,
      created_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminUpdate: async (ctx) => {
    const id = ctx.params.id;
    const {
      name,
      avatar_id,
      description,
      intro,
      homepage,
      title,
      tag,
      types = [],
      user_id,
    } = ctx.request.body;
    if (!name) {
      ctx.state.code = 0;
      ctx.state.data.message = "导师名称不能为空";
      return;
    }
    await Mentors.update(id, {
      name,
      avatar_id,
      description,
      intro,
      homepage,
      title,
      tag,
      types: stringify(types),
      user_id,
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDelete: async (ctx) => {
    const id = ctx.params.id;
    await Mentors.update(id, { deleted_at: new Date() });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
};

module.exports = mentorController;
