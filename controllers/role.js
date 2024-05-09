const Roles = require("../models/roles");
const Users = require("../models/users");
const { nanoid } = require("../utils/nanoid");
const { stringify } = require("../utils/tool");
const { formatTime } = require("../utils/date");

const roleController = {
  adminAll: async (ctx) => {
    const res = await Roles.select("id", "uuid", "name").whereNull(
      "deleted_at"
    );
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  adminIndex: async (ctx) => {
    const { search = "", page = 1, page_size = 20 } = ctx.request.query;
    const params = { deleted_at: null };
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    const andWhereParams = function () {
      this.where("uuid", "like", `%${search}%`)
        .orWhere("name", "like", `%${search}%`)
        .orWhere("description", "like", `%${search}%`);
    };
    const totalRes = await Roles.count().where(params).andWhere(andWhereParams);
    const total = totalRes.count;
    const res = await Roles.select()
      .where(params)
      .andWhere(andWhereParams)
      .orderBy("id")
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
  adminShow: async (ctx) => {
    const id = ctx.params.id;
    const res = await Roles.first(
      "id",
      "uuid",
      "name",
      "description",
      "platforms",
      "permissions"
    ).where({ id, deleted_at: null });
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  adminInsert: async (ctx) => {
    const {
      name,
      description,
      platforms = [],
      permissions = [],
    } = ctx.request.body;
    if (!name) {
      ctx.state.code = 0;
      ctx.state.data.message = "角色名称不能为空";
      return;
    }
    await Roles.insert({
      uuid: nanoid(8),
      name,
      description,
      platforms: stringify(platforms),
      permissions: stringify(permissions),
      creator_id: ctx.state.userInfo.id,
      created_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminUpdate: async (ctx) => {
    const id = ctx.params.id;
    if (id == 1) {
      ctx.state.code = 0;
      ctx.state.data.message = "该角色无法编辑";
      return;
    }
    const { name, description, platforms, permissions } = ctx.request.body;
    if (!name) {
      ctx.state.code = 0;
      ctx.state.data.message = "角色名称不能为空";
      return;
    }
    await Roles.update(id, {
      name,
      description,
      platforms: stringify(platforms),
      permissions: stringify(permissions),
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDelete: async (ctx) => {
    const id = ctx.params.id;
    if (id == 1 || id == 2) {
      ctx.state.code = 0;
      ctx.state.data.message = "该角色无法删除";
      return;
    }
    await Roles.update(id, { deleted_at: new Date() });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminTabs: async (ctx) => {
    ctx.state.code = 200;
    ctx.state.data = {
      common: [
        {
          label: "全局",
          groups: [
            {
              label: "下拉菜单",
              permissions: [
                {
                  label: "下拉菜单 - 修改密码",
                  value: "common.user.password.update",
                },
              ],
            },
            {
              label: "枚举常量",
              permissions: [
                { label: "枚举常量 - 获取常量", value: "common.enum" },
                { label: "枚举常量 - 获取文本", value: "common.enum.label" },
              ],
            },
          ],
        },
        {
          label: "腾讯云服务",
          groups: [
            {
              label: "对象存储 COS",
              permissions: [
                { label: "COS - 配置", value: "common.cos.config" },
                { label: "COS - 新增", value: "common.cos.insert" },
              ],
            },
          ],
        },
      ],
      my: [
        {
          label: "全局",
          groups: [
            {
              label: "个人中心",
              permissions: [
                { label: "个人中心 - 页面", value: "my.home.index" },
              ],
            },
            {
              label: "导学课",
              permissions: [
                { label: "导学课 - 页面", value: "my.intro-course.index" },
              ],
            },
            {
              label: "X-Challenge",
              permissions: [
                { label: "X-Challenge - 页面", value: "my.xc.index" },
              ],
            },
            {
              label: "评估探索",
              permissions: [
                { label: "评估探索 - 页面", value: "my.assessment.index" },
              ],
            },
            {
              label: "申请报名",
              permissions: [
                { label: "申请报名 - 页面", value: "my.enroll.index" },
              ],
            },
            {
              label: "个人画像",
              permissions: [
                { label: "个人画像 - 页面", value: "my.persona.index" },
              ],
            },
            {
              label: "俱乐部",
              permissions: [{ label: "俱乐部 - 页面", value: "my.club.index" }],
            },
            {
              label: "了解零一",
              permissions: [
                { label: "了解零一 - 页面", value: "my.linyi.index" },
              ],
            },
            {
              label: "个人设置",
              permissions: [
                { label: "个人设置 - 详情", value: "my.user.info.show" },
                { label: "个人设置 - 编辑", value: "my.user.info.update" },
              ],
            },
          ],
        },
      ],
      xc: [
        {
          label: "赛事",
          groups: [
            {
              label: "比赛",
              permissions: [
                { label: "比赛 - 展示列表", value: "xc.contest.all" },
                { label: "比赛 - 展示详情", value: "xc.contest.show" },
              ],
            },
            {
              label: "赛题",
              permissions: [
                { label: "赛题 - 展示列表", value: "xc.question.all" },
                { label: "赛题 - 展示详情", value: "xc.question.show" },
                { label: "赛题 - 参与/完成/恢复", value: "xc.action" },
                { label: "赛题 - 提交操作", value: "xc.question.run" },
              ],
            },
          ],
        },
      ],
      fuwu: [
        {
          label: "评分",
          groups: [
            {
              label: "挑战作品评分",
              permissions: [
                {
                  label: "作品评分 - 列表",
                  value: "fuwu.question.score.index",
                },
                {
                  label: "作品评分 - 锁定作品",
                  value: "fuwu.question.score.lock",
                },
                {
                  label: "作品评分 - 释放作品",
                  value: "fuwu.question.score.release",
                },
                {
                  label: "作品评分 - 提交评分",
                  value: "fuwu.question.score.submit",
                },
                {
                  label: "作品评分 - 评分维度",
                  value: "fuwu.question.score.dimension.all",
                },
              ],
            },
          ],
        },
      ],
      admin: [
        {
          label: "赛事管理",
          groups: [
            {
              label: "比赛管理",
              permissions: [
                { label: "比赛 - 列表", value: "admin.contest.index" },
                { label: "比赛 - 新增", value: "admin.contest.insert" },
                { label: "比赛 - 编辑", value: "admin.contest.update" },
                { label: "比赛 - 删除", value: "admin.contest.delete" },
                {
                  label: "比赛方向 - 列表",
                  value: "admin.contest.direction.index",
                },
                {
                  label: "比赛方向 - 新增",
                  value: "admin.contest.direction.insert",
                },
                {
                  label: "比赛方向 - 编辑",
                  value: "admin.contest.direction.update",
                },
                {
                  label: "比赛方向 - 删除",
                  value: "admin.contest.direction.delete",
                },
              ],
            },
            {
              label: "赛题管理",
              permissions: [
                { label: "赛题 - 全部", value: "admin.question.all" },
                { label: "赛题 - 列表", value: "admin.question.index" },
                { label: "赛题 - 新增", value: "admin.question.insert" },
                { label: "赛题 - 编辑", value: "admin.question.update" },
                {
                  label: "赛题 - 参赛者更新",
                  value: "admin.question.update.users",
                },
                {
                  label: "赛题 - 评分者更新",
                  value: "admin.question.update.evaluators",
                },
                { label: "赛题 - 删除", value: "admin.question.delete" },

                {
                  label: "赛题 - 功能按钮 - 列表",
                  value: "admin.question.btn.index",
                },
                {
                  label: "赛题 - 功能按钮 - 新增",
                  value: "admin.question.btn.insert",
                },
                {
                  label: "赛题 - 功能按钮 - 编辑",
                  value: "admin.question.btn.update",
                },
                {
                  label: "赛题 - 功能按钮 - 删除",
                  value: "admin.question.btn.delete",
                },
                {
                  label: "赛题 - 功能按钮 - 详情",
                  value: "admin.question.btn.show",
                },
                {
                  label: "赛题 - 功能按钮 - 详情编辑",
                  value: "admin.question.btn.show.update",
                },
                {
                  label: "赛题 - 功能按钮 - 详情自测",
                  value: "admin.question.btn.show.test",
                },
                {
                  label: "赛题 - 功能按钮记录 - 列表",
                  value: "admin.question.btn.log.index",
                },
                {
                  label: "赛题 - 功能按钮记录数据 - 列表",
                  value: "admin.question.btn.log.data.index",
                },
              ],
            },
            {
              label: "挑战领域",
              permissions: [
                {
                  label: "挑战领域 - 全部",
                  value: "admin.challenge.domain.all",
                },
                {
                  label: "挑战领域 - 列表",
                  value: "admin.challenge.domain.index",
                },
                {
                  label: "挑战领域 - 新增",
                  value: "admin.challenge.domain.insert",
                },
                {
                  label: "挑战领域 - 编辑",
                  value: "admin.challenge.domain.update",
                },
                {
                  label: "挑战领域 - 删除",
                  value: "admin.challenge.domain.delete",
                },
              ],
            },
          ],
        },
        {
          label: "服务管理",
          groups: [
            {
              label: "评分维度",
              permissions: [
                {
                  label: "评分维度 - 列表",
                  value: "admin.question.score.dimension.index",
                },
                {
                  label: "评分维度 - 新增",
                  value: "admin.question.score.dimension.insert",
                },
                {
                  label: "评分维度 - 编辑",
                  value: "admin.question.score.dimension.update",
                },
                {
                  label: "评分维度 - 删除",
                  value: "admin.question.score.dimension.delete",
                },
              ],
            },
          ],
        },
        {
          label: "权限管理",
          groups: [
            {
              label: "角色",
              permissions: [
                { label: "角色 - TAB", value: "admin.role.tabs" },
                { label: "角色 - 全部", value: "admin.role.all" },
                { label: "角色 - 列表", value: "admin.role.index" },
                { label: "角色 - 新增", value: "admin.role.insert" },
                { label: "角色 - 详情", value: "admin.role.show" },
                { label: "角色 - 编辑", value: "admin.role.update" },
                { label: "角色 - 删除", value: "admin.role.delete" },
              ],
            },
            {
              label: "用户",
              permissions: [
                { label: "用户 - 全部", value: "admin.user.all" },
                { label: "用户 - 列表", value: "admin.user.index" },
                { label: "用户 - 新增", value: "admin.user.insert" },
                { label: "用户 - 编辑", value: "admin.user.update" },
                { label: "用户 - 禁/启用", value: "admin.user.disable" },
              ],
            },
            {
              label: "导师",
              permissions: [
                { label: "导师 - 全部", value: "admin.mentor.all" },
                { label: "导师 - 列表", value: "admin.mentor.index" },
                { label: "导师 - 新增", value: "admin.mentor.insert" },
                { label: "导师 - 编辑", value: "admin.mentor.update" },
                { label: "导师 - 删除", value: "admin.mentor.delete" },
              ],
            },
          ],
        },
      ],
    };
  },
};

module.exports = roleController;
