const Enums = require("../models/enums");

const enumController = {
  getConst: async (ctx) => {
    const { types, mode } = ctx.request.query;
    if (!types) {
      ctx.state.code = 0;
      ctx.state.data.message = "类型不能为空";
      return;
    }
    const typeArr = types.split(",");
    const res = await Enums.select("type", "label", "value").whereIn(
      "type",
      typeArr
    );
    const r = {};
    for (const item of res) {
      const { type, value, label } = item;
      if (!r[type]) r[type] = mode === "obj" ? {} : [];
      if (mode === "obj") r[type][value] = label;
      else r[type].push({ label, value });
    }
    ctx.state.code = 200;
    ctx.state.data = r;
  },
  getLabel: async (ctx) => {
    const { type, value } = ctx.request.query;
    if (!type || !value) {
      ctx.state.code = 0;
      ctx.state.data.message = "类型和数值不能为空";
      return;
    }
    const res = await Enums.first("label").where({ type, value });
    ctx.state.code = 200;
    ctx.state.data = res?.label || "";
  },
};

module.exports = enumController;
