const QuestionScoreDimensions = require("../models/question_score_dimensions");
const Users = require("../models/users");
const { nanoid } = require("../utils/nanoid");
const { formatTime } = require("../utils/date");

const dimensionController = {
  adminIndex: async (ctx) => {
    const { page = 1, page_size = 20, search = "" } = ctx.request.query;
    const params = { deleted_at: null };
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    const andWhereParams = function () {
      this.where("uuid", "like", `%${search}%`).orWhere(
        "dimension_name",
        "like",
        `%${search}%`
      );
    };
    const totalRes = await QuestionScoreDimensions.count()
      .where(params)
      .andWhere(andWhereParams);
    const total = totalRes.count;
    const res = await QuestionScoreDimensions.select()
      .where(params)
      .andWhere(andWhereParams)
      .orderBy([{ column: "order", order: "desc" }, { column: "id" }])
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);
    for (const item of res) {
      item.created_at = formatTime(item.created_at);
      if (item.updated_at) item.updated_at = formatTime(item.updated_at);
      const [creator, editor] = await Promise.all([
        Users.first("id", "name").where({ id: item.creator_id }),
        Users.first("id", "name").where({ id: item.editor_id }),
      ]);
      item.creator = creator;
      item.editor = editor;
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
      dimension_name,
      dimension_weight = 0,
      description,
      order = 0,
    } = ctx.request.body;
    if (!dimension_name) {
      ctx.state.code = 0;
      ctx.state.data.message = "维度名称不能为空";
      return;
    }
    await QuestionScoreDimensions.insert({
      uuid: nanoid(8),
      dimension_name,
      dimension_weight,
      description,
      order,
      creator_id: ctx.state.userInfo.id,
      created_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminUpdate: async (ctx) => {
    const id = ctx.params.id;
    const { dimension_name, dimension_weight, description, order } =
      ctx.request.body;
    if (!dimension_name) {
      ctx.state.code = 0;
      ctx.state.data.message = "维度名称不能为空";
      return;
    }
    await QuestionScoreDimensions.update(id, {
      dimension_name,
      dimension_weight,
      description,
      order,
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDelete: async (ctx) => {
    const id = ctx.params.id;
    await QuestionScoreDimensions.update(id, { deleted_at: new Date() });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },

  fuwuAll: async (ctx) => {
    const res = await QuestionScoreDimensions.select(
      "uuid",
      "dimension_name",
      "dimension_weight",
      "description"
    )
      .where({
        deleted_at: null,
      })
      .orderBy([{ column: "order", order: "desc" }, { column: "id" }]);
    ctx.state.code = 200;
    ctx.state.data = res;
  },
};

module.exports = dimensionController;
