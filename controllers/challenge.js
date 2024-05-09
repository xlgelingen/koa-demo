const ChallengeDomains = require("../models/challenge_domains");
const ChallengeActions = require("../models/challenge_actions");
const QuestionScores = require("../models/question_scores");
const User = require("../models/users");
const Mentors = require("../models/mentors");
const { nanoid } = require("../utils/nanoid");
const { formatTime } = require("../utils/date");

const challengeController = {
  adminDomainAll: async (ctx) => {
    const res = await ChallengeDomains.select("id", "name", "direction").where({
      deleted_at: null,
    });
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  adminDomainIndex: async (ctx) => {
    const { page = 1, page_size = 20, search = "" } = ctx.request.query;
    const params = { deleted_at: null };
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    const andWhereParams = function () {
      this.where("uuid", "like", `%${search}%`)
        .orWhere("name", "like", `%${search}%`)
        .orWhere("direction", "like", `%${search}%`);
    };
    const totalRes = await ChallengeDomains.count()
      .where(params)
      .andWhere(andWhereParams);
    const total = totalRes.count;
    const res = await ChallengeDomains.select()
      .where(params)
      .andWhere(andWhereParams)
      .orderBy("id", "desc")
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);
    for (const item of res) {
      item.created_at = formatTime(item.created_at);
      if (item.updated_at) item.updated_at = formatTime(item.updated_at);
      const [mentor, creator, editor] = await Promise.all([
        Mentors.first("id", "name").where({ id: item.mentor_id }),
        User.first("id", "name").where({ id: item.creator_id }),
        User.first("id", "name").where({ id: item.editor_id }),
      ]);
      item.mentor = mentor;
      item.creator = creator;
      item.editor = editor;
      delete item.mentor_id;
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
  adminDomainInsert: async (ctx) => {
    const { name, description, intro, direction, mentor_id } = ctx.request.body;
    if (!name || !direction) {
      ctx.state.code = 0;
      ctx.state.data.message = "领域和领域方向不能为空";
      return;
    }
    await ChallengeDomains.insert({
      uuid: nanoid(8),
      name,
      description,
      intro,
      direction,
      mentor_id,
      creator_id: ctx.state.userInfo.id,
      created_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDomainUpdate: async (ctx) => {
    const id = ctx.params.id;
    const { name, description, intro, direction, mentor_id } = ctx.request.body;
    if (!name || !direction) {
      ctx.state.code = 0;
      ctx.state.data.message = "领域和领域方向不能为空";
      return;
    }
    await ChallengeDomains.update(id, {
      name,
      description,
      intro,
      direction,
      mentor_id,
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDomainDelete: async (ctx) => {
    const id = ctx.params.id;
    await ChallengeDomains.update(id, { deleted_at: new Date() });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },

  xcAction: async (ctx) => {
    const { contest_uuid, contest_direction_uuid, question_uuid, type } =
      ctx.request.body;
    const userId = ctx.state.userInfo.id;
    const uuid = nanoid(8);
    const res = await ChallengeActions.first("id", "status").where({
      contest_uuid,
      contest_direction_uuid,
      question_uuid,
      creator_id: userId,
    });
    if (!res) {
      if (type === "join") {
        await ChallengeActions.insert({
          uuid,
          contest_uuid,
          contest_direction_uuid,
          question_uuid,
          status: 1,
          creator_id: userId,
          created_at: new Date(),
        });
      } else {
        ctx.state.code = 0;
        ctx.state.data.message = "该挑战已参与";
        return;
      }
    } else {
      if (res.status === 1 && type === "finish") {
        await ChallengeActions.update(res.id, {
          status: 2,
          editor_id: userId,
          updated_at: new Date(),
        });
      } else if (res.status === 2 && type === "resume") {
        const sRes = await QuestionScores.first("status").where({
          contest_uuid,
          contest_direction_uuid,
          question_uuid,
          user_id: userId,
          deleted_at: null,
        });
        if (!sRes || sRes.status === 1) {
          await ChallengeActions.update(res.id, {
            status: 1,
            editor_id: userId,
            updated_at: new Date(),
          });
        } else {
          ctx.state.code = 0;
          ctx.state.data.message = "改赛题已评价，无法重新挑战";
          return;
        }
      } else {
        ctx.state.code = 0;
        ctx.state.data.message = "当前所属状态不支持该操作";
        return;
      }
    }
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
};

module.exports = challengeController;
