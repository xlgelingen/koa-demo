const Contests = require("../models/contests");
const ContestDirections = require("../models/contest_directions");
const Users = require("../models/users");
const COS = require("../models/cos");
const Questions = require("../models/questions");
const Enums = require("../models/enums");
const ChallengeDomains = require("../models/challenge_domains");
const { nanoid } = require("../utils/nanoid");
const { stringify } = require("../utils/tool");
const { formatTime } = require("../utils/date");

const contestsController = {
  adminIndex: async (ctx) => {
    const { page = 1, page_size = 20, search = "", status } = ctx.request.query;
    const params = { deleted_at: null };
    if (status) params.status = Number(status);
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    const andWhereParams = function () {
      this.where("uuid", "like", `%${search}%`).orWhere(
        "name",
        "like",
        `%${search}%`
      );
    };
    const totalRes = await Contests.count()
      .where(params)
      .andWhere(andWhereParams);
    const total = totalRes.count;
    const res = await Contests.select()
      .where(params)
      .andWhere(andWhereParams)
      .orderBy([{ column: "order", order: "desc" }, { column: "id" }])
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);
    for (const item of res) {
      item.created_at = formatTime(item.created_at);
      if (item.updated_at) item.updated_at = formatTime(item.updated_at);
      const [cover, creator, editor, directions] = await Promise.all([
        COS.first("id", "name", "url").where({ id: item.cover_id }),
        Users.first("id", "name").where({ id: item.creator_id }),
        Users.first("id", "name").where({ id: item.editor_id }),
        ContestDirections.select("id", "name").where({
          contest_id: item.id,
          deleted_at: null,
        }),
      ]);
      item.cover = cover || {};
      item.creator = creator;
      item.editor = editor;
      item.directions = directions;
      delete item.cover_id;
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
      description,
      subtitle,
      desc,
      cover_id,
      order = 0,
      status = 0,
    } = ctx.request.body;
    if (!name) {
      ctx.state.code = 0;
      ctx.state.data.message = "比赛名称不能为空";
      return;
    }
    await Contests.insert({
      uuid: nanoid(8),
      name,
      description,
      subtitle,
      desc,
      cover_id,
      order,
      status,
      creator_id: ctx.state.userInfo.id,
      created_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminUpdate: async (ctx) => {
    const id = ctx.params.id;
    const { name, description, subtitle, desc, cover_id, order, status } =
      ctx.request.body;
    if (!name) {
      ctx.state.code = 0;
      ctx.state.data.message = "比赛名称不能为空";
      return;
    }
    await Contests.update(id, {
      name,
      description,
      subtitle,
      desc,
      cover_id,
      order,
      status,
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDelete: async (ctx) => {
    const id = ctx.params.id;
    await Contests.update(id, { deleted_at: new Date() });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDirectionIndex: async (ctx) => {
    const contest_id = ctx.params.id;
    const { page = 1, page_size = 20, search = "", status } = ctx.request.query;
    const params = { deleted_at: null, contest_id };
    if (status) params.status = Number(status);
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    const andWhereParams = function () {
      this.where("uuid", "like", `%${search}%`).orWhere(
        "name",
        "like",
        `%${search}%`
      );
    };
    const totalRes = await ContestDirections.count()
      .where(params)
      .andWhere(andWhereParams);
    const total = totalRes.count;
    const res = await ContestDirections.select()
      .where(params)
      .andWhere(andWhereParams)
      .orderBy([{ column: "order", order: "desc" }, { column: "id" }])
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);
    for (const item of res) {
      item.created_at = formatTime(item.created_at);
      if (item.updated_at) item.updated_at = formatTime(item.updated_at);
      const [creator, editor, contest, questions] = await Promise.all([
        Users.first("id", "name").where({ id: item.creator_id }),
        Users.first("id", "name").where({ id: item.editor_id }),
        Contests.first("id", "name").where({ id: item.contest_id }),
        Questions.select("id", "name").whereIn("id", item.question_ids),
      ]);
      item.creator = creator;
      item.editor = editor;
      item.contest = contest;
      item.questions = questions;
      delete item.creator_id;
      delete item.editor_id;
      delete item.contest_id;
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
  adminDirectionInsert: async (ctx) => {
    const contest_id = ctx.params.id;
    const { name, question_ids = [], order = 0, status = 0 } = ctx.request.body;
    if (!name) {
      ctx.state.code = 0;
      ctx.state.data.message = "比赛方向名称不能为空";
      return;
    }
    await ContestDirections.insert({
      uuid: nanoid(8),
      name,
      contest_id,
      question_ids: stringify(question_ids),
      order,
      status,
      creator_id: ctx.state.userInfo.id,
      created_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDirectionUpdate: async (ctx) => {
    const id = ctx.params.id;
    const { name, question_ids, order, status } = ctx.request.body;
    if (!name) {
      ctx.state.code = 0;
      ctx.state.data.message = "比赛方向名称不能为空";
      return;
    }
    await ContestDirections.update(id, {
      name,
      question_ids: stringify(question_ids),
      order,
      status,
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDirectionDelete: async (ctx) => {
    const id = ctx.params.id;
    await ContestDirections.update(id, { deleted_at: new Date() });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },

  xcAll: async (ctx) => {
    const res = await Contests.select(
      "id",
      "uuid",
      "name",
      "description",
      "subtitle",
      "desc",
      "cover_id"
    )
      .orderBy([{ column: "order", order: "desc" }, { column: "id" }])
      .where({ status: 2, deleted_at: null });
    for (const item of res) {
      const [cover, dirRes] = await Promise.all([
        COS.first("id", "name", "url").where({ id: item.cover_id }),
        ContestDirections.select("question_ids").where({
          contest_id: item.id,
          status: 1,
          deleted_at: null,
        }),
      ]);
      item.cover = cover || {};
      delete item.cover_id;
      const length = dirRes.length;
      item.direction_total = length;
      if (length === 0) item.question_total = 0;
      else {
        let total = 0;
        item.questions = [];
        for (const subitem of dirRes) {
          const qRes = await Questions.select(
            "name",
            "difficulty",
            "tag",
            "category",
            "subject",
            "challenge_domain_ids"
          )
            .whereIn("id", subitem.question_ids || [])
            .where({ type: 2, status: 1, deleted_at: null });
          for (const qItem of qRes) {
            const [tag, category] = await Promise.all([
              Enums.first("label").where({
                type: "question_tag",
                value: qItem.tag,
              }),
              Enums.first("label").where({
                type: "question_category",
                value: qItem.category,
              }),
            ]);
            qItem.tag_label = tag?.label || "";
            qItem.category_label = category?.label || "";

            qItem.challenge_domains = [];
            for (const i of qItem.challenge_domain_ids || []) {
              const cRes = await ChallengeDomains.first(
                "name",
                "direction"
              ).where({
                id: i,
                deleted_at: null,
              });
              if (cRes) qItem.challenge_domains.push(cRes);
            }
            delete qItem.challenge_domain_ids;
          }
          item.questions.push(...qRes);
          total += qRes.length;
        }
        item.question_total = total;
      }
    }
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  xcShow: async (ctx) => {
    const uuid = ctx.params.id;
    const res = await Contests.first(
      "id",
      "uuid",
      "name",
      "description",
      "subtitle",
      "desc",
      "cover_id"
    ).where({ uuid, status: 2, deleted_at: null });
    if (!res) {
      ctx.state.code = 0;
      ctx.state.data.message = "该比赛未开放或不存在";
      return;
    }

    const [cover, dirRes] = await Promise.all([
      COS.first("id", "name", "url").where({ id: res.cover_id }),
      ContestDirections.select("uuid", "name", "question_ids")
        .orderBy([{ column: "order", order: "desc" }, { column: "id" }])
        .where({
          contest_id: res.id,
          status: 1,
          deleted_at: null,
        }),
    ]);
    res.cover = cover || {};
    delete res.cover_id;
    let total = 0;
    for (const item of dirRes) {
      item.questions = await Questions.select(
        "name",
        "description",
        "key",
        "cover_ids",
        "difficulty",
        "tag",
        "category",
        "subject",
        "challenge_domain_ids"
      )
        .whereIn("id", item.question_ids || [])
        .where({ type: 2, status: 1, deleted_at: null });
      for (const subitem of item.questions) {
        subitem.covers = [];
        for (const i of subitem.cover_ids || []) {
          const cRes = await COS.first("name", "url").where({ id: i });
          if (cRes) subitem.covers.push(cRes);
        }
        subitem.cover_url = subitem.covers[0]?.url || "";
        delete subitem.cover_ids;

        const [tag, category] = await Promise.all([
          Enums.first("label").where({
            type: "question_tag",
            value: subitem.tag,
          }),
          Enums.first("label").where({
            type: "question_category",
            value: subitem.category,
          }),
        ]);
        subitem.tag_label = tag?.label || "";
        subitem.category_label = category?.label || "";

        subitem.challenge_domains = [];
        for (const i of subitem.challenge_domain_ids || []) {
          const cRes = await ChallengeDomains.first("name", "direction").where({
            id: i,
            deleted_at: null,
          });
          if (cRes) subitem.challenge_domains.push(cRes);
        }
        delete subitem.challenge_domain_ids;
      }
      total += (item.questions || []).length;
      delete item.question_ids;
    }
    res.directions = dirRes;
    res.direction_total = dirRes.length;
    res.question_total = total;
    ctx.state.code = 200;
    ctx.state.data = res;
  },
};

module.exports = contestsController;
