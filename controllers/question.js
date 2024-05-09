const axios = require("axios");
const XLSX = require("xlsx");
const { PythonShell } = require("python-shell");
const Questions = require("../models/questions");
const QuestionBtns = require("../models/question_btns");
const QuestionBtnResults = require("../models/question_btn_results");
const QuestionBtnLogs = require("../models/question_btn_logs");
const QuestionBtnLogDatas = require("../models/question_btn_log_datas");
const QuestionScores = require("../models/question_scores");
const User = require("../models/users");
const COS = require("../models/cos");
const Contests = require("../models/contests");
const ContestDirections = require("../models/contest_directions");
const Enums = require("../models/enums");
const Mentors = require("../models/mentors");
const ChallengeDomains = require("../models/challenge_domains");
const ChallengeActions = require("../models/challenge_actions");
const { nanoid } = require("../utils/nanoid");
const { formatTime, formatT } = require("../utils/date");
const { stringify } = require("../utils/tool");

const questionController = {
  adminAll: async (ctx) => {
    const type = ctx.request.query.type;
    const params = { deleted_at: null };
    if (type) params.type = Number(type);
    const res = await Questions.select("id", "uuid", "name").where(params);
    for (const item of res) {
      const children = await QuestionBtns.select("uuid", "name").where({
        question_uuid: item.uuid,
        deleted_at: null,
      });
      if (children.length) item.children = children;
    }
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  adminIndex: async (ctx) => {
    const {
      page = 1,
      page_size = 20,
      search = "",
      type,
      difficulty,
      tag,
      category,
      status,
    } = ctx.request.query;
    const params = { deleted_at: null };
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    if (type) params.type = Number(type);
    if (difficulty) params.difficulty = Number(difficulty);
    if (tag) params.tag = Number(tag);
    if (category) params.category = Number(category);
    if (status) params.status = Number(status);
    const andWhereParams = function () {
      this.where("uuid", "like", `%${search}%`)
        .orWhere("name", "like", `%${search}%`)
        .orWhere("description", "like", `%${search}%`)
        .orWhere("key", "like", `%${search}%`)
        .orWhere("title", "like", `%${search}%`)
        .orWhere("org", "like", `%${search}%`);
    };
    const totalRes = await Questions.count()
      .where(params)
      .andWhere(andWhereParams);
    const total = totalRes.count;
    const res = await Questions.select()
      .where(params)
      .andWhere(andWhereParams)
      .orderBy("id", "desc")
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);
    for (const item of res) {
      item.created_at = formatTime(item.created_at);
      if (item.updated_at) item.updated_at = formatTime(item.updated_at);
      const [
        creator,
        editor,
        btns,
        covers,
        typeRes,
        tagRes,
        categoryRes,
        statusRes,
      ] = await Promise.all([
        User.first("id", "name").where({ id: item.creator_id }),
        User.first("id", "name").where({ id: item.editor_id }),
        QuestionBtns.select("id", "uuid", "name", "key", "label").where({
          question_uuid: item.uuid,
          deleted_at: null,
        }),
        COS.select("id", "name", "url").whereIn("id", item.cover_ids || []),
        Enums.first("label").where({ type: "question_type", value: item.type }),
        Enums.first("label").where({ type: "question_tag", value: item.tag }),
        Enums.first("label").where({
          type: "question_category",
          value: item.category,
        }),
        Enums.first("label").where({
          type: "question_status",
          value: item.status,
        }),
      ]);
      item.creator = creator;
      item.editor = editor;
      item.btns = btns;
      item.covers = (item.cover_ids || []).map((i) => {
        const r = { id: i };
        covers.forEach((c) => {
          if (c.id === i) (r.name = c.name), (r.url = c.url);
        });
        return r;
      });
      item.type_label = typeRes?.label || "";
      item.tag_label = tagRes?.label || "";
      item.category_label = categoryRes?.label || "";
      item.status_label = statusRes?.label || "";
      delete item.creator_id;
      delete item.editor_id;
      delete item.cover_ids;
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
      key,
      type = 1,
      cover_ids,
      difficulty = 0,
      title,
      org,
      desc,
      exp,
      tag = 0,
      category,
      status,
      subject = [],
      mentors = [],
      challenge_domain_ids = [],
      btns = [],
    } = ctx.request.body;
    if (!name || !key) {
      ctx.state.code = 0;
      ctx.state.data.message = "赛题名称和唯一标识不能为空";
      return;
    }
    const res = await Questions.first("id").where({ key, deleted_at: null });
    if (res) {
      ctx.state.code = 0;
      ctx.state.data.message = "该唯一标识已存在";
      return;
    }
    const uuid = nanoid(8);
    await Questions.insert({
      uuid,
      name,
      description,
      key,
      type,
      cover_ids: stringify(cover_ids),
      difficulty,
      title,
      org,
      desc,
      exp,
      tag,
      category,
      status,
      subject: stringify(subject),
      mentors: stringify(mentors),
      challenge_domain_ids: stringify(challenge_domain_ids),
      creator_id: ctx.state.userInfo.id,
      created_at: new Date(),
    });
    for (const item of btns) {
      if (item.name && item.key && item.label) {
        const btnRes = await QuestionBtns.first("id").where({
          key: item.key,
          question_uuid: uuid,
          deleted_at: null,
        });
        if (!btnRes) {
          await QuestionBtns.insert({
            uuid: nanoid(8),
            name: item.name,
            key: item.key,
            label: item.label,
            question_uuid: uuid,
            creator_id: ctx.state.userInfo.id,
            created_at: new Date(),
          });
        }
      }
    }
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminUpdate: async (ctx) => {
    const id = ctx.params.id;
    const {
      name,
      description,
      key,
      type,
      cover_ids,
      difficulty,
      title,
      org,
      desc,
      exp,
      tag,
      category,
      status,
      subject,
      mentors,
      challenge_domain_ids,
    } = ctx.request.body;
    if (!name || !key) {
      ctx.state.code = 0;
      ctx.state.data.message = "赛题名称和唯一标识不能为空";
      return;
    }
    const res = await Questions.first("id").where({ key, deleted_at: null });
    if (res && res.id != id) {
      ctx.state.code = 0;
      ctx.state.data.message = "该唯一标识已存在";
      return;
    }
    await Questions.update(id, {
      name,
      description,
      key,
      type,
      cover_ids: stringify(cover_ids),
      difficulty,
      title,
      org,
      desc,
      exp,
      tag,
      category,
      status,
      subject: stringify(subject),
      mentors: stringify(mentors),
      challenge_domain_ids: stringify(challenge_domain_ids),
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminUpdateUsers: async (ctx) => {
    const id = ctx.params.id;
    const user_ids = stringify(ctx.request.body.user_ids || []);
    await Questions.update(id, {
      user_ids,
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminUpdateEvaluators: async (ctx) => {
    const id = ctx.params.id;
    const evaluator_ids = stringify(ctx.request.body.evaluator_ids || []);
    await Questions.update(id, {
      evaluator_ids,
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminDelete: async (ctx) => {
    const id = ctx.params.id;
    await Questions.update(id, { deleted_at: new Date() });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminBtnIndex: async (ctx) => {
    const question_uuid = ctx.request.query.question_uuid;
    const res = await QuestionBtns.select(
      "id",
      "uuid",
      "name",
      "key",
      "label"
    ).where({ question_uuid, deleted_at: null });
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  adminBtnInsert: async (ctx) => {
    const { question_uuid, name, key, label } = ctx.request.body;
    if (!question_uuid || !name || !key || !label) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const res = await QuestionBtns.first("id").where({
      key,
      question_uuid,
      deleted_at: null,
    });
    if (res) {
      ctx.state.code = 0;
      ctx.state.data.message = "该唯一标识已存在";
      return;
    }
    await QuestionBtns.insert({
      uuid: nanoid(8),
      name,
      key,
      label,
      question_uuid,
      creator_id: ctx.state.userInfo.id,
      created_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminBtnUpdate: async (ctx) => {
    const id = ctx.params.id;
    const { question_uuid, name, key, label } = ctx.request.body;
    if (!name || !key || !label) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const res = await QuestionBtns.first("id").where({
      key,
      question_uuid,
      deleted_at: null,
    });
    if (res && res.id != id) {
      ctx.state.code = 0;
      ctx.state.data.message = "该唯一标识已存在";
      return;
    }
    await QuestionBtns.update(id, {
      name,
      key,
      label,
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminBtnDelete: async (ctx) => {
    const id = ctx.params.id;
    await QuestionBtns.update(id, { deleted_at: new Date() });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminBtnShow: async (ctx) => {
    const uuid = ctx.params.id;
    const res = await QuestionBtns.first(
      "id",
      "uuid",
      "name",
      "key",
      "label",
      "desc",
      "status",
      "type",
      "lang",
      "script",
      "config",
      "question_uuid"
    ).where({ uuid, deleted_at: null });
    res.file_name = "";
    res.file_url = "";
    const r = await QuestionBtnResults.first("sheet", "result", "cos_id").where(
      {
        question_btn_uuid: uuid,
        deleted_at: null,
      }
    );
    if (r && r.cos_id) {
      const cos = await COS.first("name", "url").where({ id: r.cos_id });
      res.file_name = cos.name || "";
      res.file_url = cos.url || "";
    }
    res.file_sheet = r?.sheet || "";
    res.file_content = r?.result || [];
    const questionRes = await Questions.first("key").where({
      uuid: res.question_uuid,
      deleted_at: null,
    });
    res.question_key = questionRes.key;
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  adminBtnShowUpdate: async (ctx) => {
    const id = ctx.params.id;
    const {
      name,
      key,
      label,
      desc,
      status,
      type,
      lang,
      script,
      config = {},
      question_uuid,
      file_id,
      file_sheet,
    } = ctx.request.body;
    if (!name || !key || !label) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const res = await QuestionBtns.first("id", "uuid").where({
      key,
      question_uuid,
      deleted_at: null,
    });
    if (res && res.id != id) {
      ctx.state.code = 0;
      ctx.state.data.message = "该唯一标识已存在";
      return;
    }
    await QuestionBtns.update(id, {
      name,
      key,
      label,
      desc,
      status,
      type,
      lang,
      script,
      config: stringify(config),
      editor_id: ctx.state.userInfo.id,
      updated_at: new Date(),
    });
    if (file_id) {
      const cosRes = await COS.first("url").where({ id: file_id });
      const splitArr = cosRes.url.split(".");
      const extension = splitArr[splitArr.length - 1];
      const responseType = extension === "csv" ? "" : "arraybuffer";
      const opts = extension === "csv" ? { type: "string", raw: true } : {};
      const axiosRes = await axios.get(cosRes.url, { responseType });
      const ws = XLSX.utils.sheet_to_json(
        XLSX.read(axiosRes.data, opts).Sheets[file_sheet || "Sheet1"]
      );

      const resultRes = await QuestionBtnResults.first("id").where({
        question_btn_uuid: res.uuid,
        deleted_at: null,
      });
      if (resultRes) {
        await QuestionBtnResults.update(resultRes.id, {
          sheet: file_sheet,
          result: stringify(ws),
          cos_id: file_id,
          editor_id: ctx.state.userInfo.id,
          updated_at: new Date(),
        });
      } else {
        await QuestionBtnResults.insert({
          uuid: nanoid(8),
          sheet: file_sheet,
          result: stringify(ws),
          cos_id: file_id,
          question_btn_uuid: res.uuid,
          creator_id: ctx.state.userInfo.id,
          created_at: new Date(),
        });
      }
    }
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  adminBtnShowTest: async (ctx) => {
    const uuid = ctx.params.id;
    const testData = ctx.request.body.testData;
    if (!uuid || !testData) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const btnRes = await QuestionBtns.first("type", "lang", "script").where({
      uuid,
      deleted_at: null,
    });
    if (!btnRes) {
      ctx.state.code = 0;
      ctx.state.data.message = "赛题功能按钮不存在";
      return;
    }
    const params1 = eval("(" + testData + ")");
    const resultRes = await QuestionBtnResults.first("result").where({
      question_btn_uuid: uuid,
      deleted_at: null,
    });
    const params2 = resultRes?.result || [];

    let status = 0;
    let score = 0;
    let result = null;
    if (!btnRes.lang || !btnRes.script)
      result = stringify("请到后台完善脚本管理");
    else {
      try {
        if (btnRes.lang === 1) {
          const v = await eval(btnRes.script)(params1, params2);
          if (
            !v?.result ||
            (!v?.score && v?.score !== 0) ||
            Number(v?.score) < 0 ||
            Number(v?.score) > 100
          )
            result = stringify("脚本返回格式有误");
          else {
            score = Number(v.score);
            result = stringify(v.result);
            status = 1;
          }
        } else if (btnRes.lang === 2) {
          let script = btnRes.script.replace(
            /{PARAMS1}/gi,
            JSON.stringify(params1)
          );
          script = script.replace(/{PARAMS2}/gi, JSON.stringify(params2));
          const pyRes = await PythonShell.runString(script, null);
          if (!pyRes.length) result = stringify("脚本没有返回");
          else {
            const v =
              typeof pyRes[0] === "string"
                ? eval("(" + pyRes[0] + ")")
                : pyRes[0];
            if (
              !v?.result ||
              (!v?.score && v?.score !== 0) ||
              Number(v?.score) < 0 ||
              Number(v?.score) > 100
            )
              result = stringify("脚本返回格式有误");
            else {
              score = Number(v.score);
              result = stringify(v.result);
              status = 1;
            }
          }
        } else result = stringify("尚不支持该脚本语言");
      } catch (e) {
        const msg = e && e.message ? e.message : e.toString();
        result = stringify(msg);
      }
    }
    ctx.state.code = 200;
    ctx.state.data = { score, result, status };
  },
  adminBtnLogIndex: async (ctx) => {
    const {
      page = 1,
      page_size = 20,
      sort_column,
      sort_order,
      type,
      uuid,
      uuid_type,
      creator_id,
      search = "",
    } = ctx.request.query;
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    const sort = sort_column
      ? [
          {
            column: sort_column,
            order: sort_order === "descending" ? "desc" : undefined,
          },
          { column: "id", order: "desc" },
        ]
      : [{ column: "id", order: "desc" }];
    const params = {};
    if (type) params.type = Number(type);
    if (uuid) params[uuid_type] = uuid;
    if (creator_id) params.creator_id = Number(creator_id);
    const andWhereParams = function () {
      this.where("uuid", "like", `%${search}%`).orWhere(
        "sheet",
        "like",
        `%${search}%`
      );
    };

    const totalRes = await QuestionBtnLogs.count()
      .where(params)
      .andWhere(andWhereParams);
    const total = totalRes.count;
    const res = await QuestionBtnLogs.select()
      .where(params)
      .andWhere(andWhereParams)
      .orderBy(sort)
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);
    for (const item of res) {
      item.created_at = formatTime(item.created_at);
      const [cos, btn, question, creator] = await Promise.all([
        COS.first("id", "name", "size", "url").where({ id: item.cos_id }),
        QuestionBtns.first("name", "key").where({
          uuid: item.question_btn_uuid,
        }),
        Questions.first("name", "key").where({ uuid: item.question_uuid }),
        User.first("id", "name").where({ id: item.creator_id }),
      ]);
      item.cos = cos ?? {};
      item.btn = btn;
      item.question = question;
      item.creator = creator;
      delete item.cos_id;
      delete item.question_btn_uuid;
      delete item.question_uuid;
      delete item.creator_id;
    }
    ctx.state.code = 200;
    ctx.state.data.list = res;
    ctx.state.data.pagination = {
      current_page: currentPage,
      per_page: pageSize,
      total,
    };
  },
  adminBtnLogDataIndex: async (ctx) => {
    const { question_btn_log_uuid } = ctx.request.query;
    const res = await QuestionBtnLogDatas.first("data").where({
      question_btn_log_uuid,
    });
    ctx.state.code = 200;
    ctx.state.data = res?.data || [];
  },

  xcAll: async (ctx) => {
    const res = await Questions.select("id", "uuid", "name", "key")
      .where({
        deleted_at: null,
      })
      .whereJsonObject("user_ids", [ctx.state.userInfo.id]);
    ctx.state.code = 200;
    ctx.state.data = res;
  },
  xcShow: async (ctx) => {
    const key = ctx.params.id;
    const { contest_uuid, contest_direction_uuid } = ctx.request.query;
    const creator_id = ctx.state.userInfo.id;
    const res = await Questions.first(
      "uuid",
      "name",
      "description",
      "type",
      "cover_ids",
      "difficulty",
      "title",
      "org",
      "desc",
      "exp",
      "tag",
      "category",
      "subject",
      "mentors",
      "challenge_domain_ids"
    ).where({
      key,
      status: 1,
      deleted_at: null,
    });
    if (!res) {
      ctx.state.code = 0;
      ctx.state.data.message = "赛题不存在";
      return;
    }
    if (res.type === 2 && (!contest_uuid || !contest_direction_uuid)) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少比赛相关参数";
      return;
    }
    if (res.type === 2) {
      const aRes = await ChallengeActions.first("status").where({
        contest_uuid,
        contest_direction_uuid,
        question_uuid: res.uuid,
        creator_id,
      });
      res.action_status = aRes?.status ?? 0;
    }
    res.btns = await QuestionBtns.select(
      "uuid",
      "name",
      "key",
      "label",
      "desc",
      "type",
      "config"
    ).where({
      status: 1,
      question_uuid: res.uuid,
      deleted_at: null,
    });
    res.ranks = [];
    for (const item of res.btns) {
      if (item.config?.logReturnLimit?.n !== 0) {
        if (
          item.config?.logReturnLimit?.t &&
          item.config?.logReturnLimit?.t !== "all"
        ) {
          item.logs = await QuestionBtnLogs.select(
            "uuid",
            "result",
            "created_at"
          )
            .where({
              question_btn_uuid: item.uuid,
              creator_id,
            })
            .whereRaw(`${item.config?.logReturnLimit?.t}(created_at) = ?`, [
              formatT(Date.now(), item.config?.logReturnLimit?.t),
            ])
            .orderBy("created_at", "desc")
            .limit(item.config?.logReturnLimit?.n ?? 10);
        } else {
          item.logs = await QuestionBtnLogs.select(
            "uuid",
            "result",
            "created_at"
          )
            .where({
              question_btn_uuid: item.uuid,
              creator_id,
            })
            .orderBy("created_at", "desc")
            .limit(item.config?.logReturnLimit?.n ?? 10);
        }
        for (const subitem of item.logs) {
          subitem.created_at = formatTime(subitem.created_at);
        }
      }
      if (item.type === 1 && item.config?.rankReturnLimit?.n !== 0) {
        let rankALL = [];
        if (
          item.config?.rankReturnLimit?.t &&
          item.config?.rankReturnLimit?.t !== "all"
        ) {
          rankALL = await QuestionBtnLogs.select(
            "score",
            "result",
            "creator_id",
            "created_at"
          )
            .where({ question_btn_uuid: item.uuid })
            .whereRaw(`${item.config?.rankReturnLimit?.t}(created_at) = ?`, [
              formatT(Date.now(), item.config?.rankReturnLimit?.t),
            ])
            .orderBy("id");
        } else {
          rankALL = await QuestionBtnLogs.select(
            "score",
            "result",
            "creator_id",
            "created_at"
          )
            .where({ question_btn_uuid: item.uuid })
            .orderBy("id");
        }
        let rank = [];
        let userArr = [];
        for (const subitem of rankALL) {
          if (item.config?.rankScoreFun) {
            const v = await eval(item.config?.rankScoreFun)(
              subitem.score,
              subitem.result
            );
            if (Number(v) >= 0 && Number(v) <= 100) subitem.score = v;
          }

          const index = userArr.indexOf(subitem.creator_id);
          if (index === -1) {
            const creator = await User.first("id", "name").where({
              id: subitem.creator_id,
            });
            userArr.push(subitem.creator_id);
            rank.push({
              score: subitem.score,
              creator,
              created_at: formatTime(subitem.created_at),
            });
          } else if (subitem.score > rank[index].score) {
            rank[index].score = subitem.score;
            rank[index].created_at = formatTime(subitem.created_at);
          }
        }
        rank.sort((a, b) => b.score - a.score);
        const length = rank.length;
        const limit = item.config?.rankReturnLimit?.n ?? 10;
        res.ranks.push({
          name: item.name,
          key: item.key,
          rank: length > limit ? rank.slice(0, limit) : rank,
        });
      }
    }

    res.covers = [];
    for (const item of res.cover_ids || []) {
      const cosRes = await COS.first("name", "url").where({ id: item });
      if (cosRes) res.covers.push(cosRes);
    }
    res.cover_url = res.covers[0]?.url || "";
    delete res.cover_ids;

    const [tag, category, mentorTypes] = await Promise.all([
      Enums.first("label").where({ type: "question_tag", value: res.tag }),
      Enums.first("label").where({
        type: "question_category",
        value: res.category,
      }),
      Enums.select("label", "value").where({ type: "mentor_type" }),
    ]);
    res.tag_label = tag?.label || "";
    res.category_label = category?.label || "";
    const mentorTypeObj = {};
    for (const item of mentorTypes) {
      mentorTypeObj[item.value] = item.label;
    }

    for (const item of res.mentors || []) {
      item.mentor_type_label = mentorTypeObj[item.mentor_type] || "";
      item.mentors = [];
      for (const subitem of item.mentor_ids || []) {
        const mRes = await Mentors.first(
          "name",
          "avatar_id",
          "description",
          "intro",
          "homepage",
          "title",
          "tag"
        ).where({ id: subitem, deleted_at: null });
        if (mRes) {
          mRes.avatar = await COS.first("name", "url").where({
            id: mRes.avatar_id,
          });
          delete mRes.avatar_id;
          item.mentors.push(mRes);
        }
      }
    }

    res.challenge_domains = [];
    for (const item of res.challenge_domain_ids || []) {
      const cRes = await ChallengeDomains.first(
        "name",
        "description",
        "intro",
        "direction",
        "mentor_id"
      ).where({
        id: item,
        deleted_at: null,
      });
      if (cRes) {
        const mRes = await Mentors.first(
          "name",
          "avatar_id",
          "description",
          "intro",
          "homepage",
          "title",
          "tag"
        ).where({ id: cRes.mentor_id, deleted_at: null });
        if (mRes) {
          mRes.avatar = await COS.first("name", "url").where({
            id: mRes.avatar_id,
          });
          delete mRes.avatar_id;
          cRes.mentor = mRes;
        } else cRes.mentor = {};
        delete cRes.mentor_id;
        res.challenge_domains.push(cRes);
      }
    }
    delete res.challenge_domain_ids;

    const eRes = await Enums.first("label").where({
      type: "mentor_type",
      value: 1,
    });
    res.mentor_type_label1 = eRes?.label || "";

    ctx.state.code = 200;
    ctx.state.data = res;
  },
  xcRun: async (ctx) => {
    const {
      contest_uuid,
      contest_direction_uuid,
      question_btn_uuid,
      file_id,
      file_name,
      file_sheet,
    } = ctx.request.body;
    const userId = ctx.state.userInfo.id;
    const uuid = nanoid(8);
    if (!question_btn_uuid || !file_id) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const btnRes = await QuestionBtns.first(
      "type",
      "lang",
      "script",
      "config",
      "question_uuid"
    ).where({
      uuid: question_btn_uuid,
      deleted_at: null,
    });
    if (!btnRes) {
      ctx.state.code = 0;
      ctx.state.data.message = "赛题功能按钮不存在";
      return;
    }
    const qRes = await Questions.first("type").where({
      uuid: btnRes.question_uuid,
      deleted_at: null,
    });
    if (!qRes) {
      ctx.state.code = 0;
      ctx.state.data.message = "赛题不存在";
      return;
    }
    if (qRes.type === 2) {
      if (!contest_uuid || !contest_direction_uuid) {
        ctx.state.code = 0;
        ctx.state.data.message = "缺少比赛相关参数";
        return;
      }
      const aRes = await ChallengeActions.first("status").where({
        contest_uuid,
        contest_direction_uuid,
        question_uuid: btnRes.question_uuid,
        creator_id: userId,
      });
      if (aRes?.status !== 1) {
        ctx.state.code = 0;
        ctx.state.data.message = "比赛赛题非挑战中状态无法提交";
        return;
      }
    }

    if (btnRes.config?.optLimit?.n) {
      let logs = [];
      if (btnRes.config?.optLimit?.t && btnRes.config?.optLimit?.t !== "all") {
        logs = await QuestionBtnLogs.select("id")
          .where({
            question_btn_uuid,
            creator_id: userId,
          })
          .whereRaw(`${btnRes.config?.optLimit?.t}(created_at) = ?`, [
            formatT(Date.now(), btnRes.config?.optLimit?.t),
          ]);
      } else
        logs = await QuestionBtnLogs.select("id").where({
          question_btn_uuid,
          creator_id: userId,
        });
      if (logs.length + 1 > btnRes.config?.optLimit?.n) {
        ctx.state.code = 0;
        ctx.state.data.message = "提交次数已达上限";
        return;
      }
    }
    if (btnRes.type === 1) {
      const cosRes = await COS.first("url").where({ id: file_id });
      const splitArr = cosRes.url.split(".");
      const extension = splitArr[splitArr.length - 1];
      const responseType = extension === "csv" ? "" : "arraybuffer";
      const opts = extension === "csv" ? { type: "string", raw: true } : {};
      const axiosRes = await axios.get(cosRes.url, { responseType });
      const params1 = XLSX.utils.sheet_to_json(
        XLSX.read(axiosRes.data, opts).Sheets[file_sheet || "Sheet1"]
      );
      const resultRes = await QuestionBtnResults.first("result").where({
        question_btn_uuid,
        deleted_at: null,
      });
      const params2 = resultRes?.result || [];

      let score = 0;
      let result = null;
      if (!btnRes.lang || !btnRes.script)
        result = stringify("请到后台完善脚本管理");
      else {
        try {
          if (btnRes.lang === 1) {
            const v = await eval(btnRes.script)(params1, params2);
            if (
              !v?.result ||
              (!v?.score && v?.score !== 0) ||
              Number(v?.score) < 0 ||
              Number(v?.score) > 100
            )
              result = stringify("脚本返回格式有误");
            else {
              score = Number(v.score);
              result = stringify(v.result);
            }
          } else if (btnRes.lang === 2) {
            let script = btnRes.script.replace(
              /{PARAMS1}/gi,
              JSON.stringify(params1)
            );
            script = script.replace(/{PARAMS2}/gi, JSON.stringify(params2));
            const pyRes = await PythonShell.runString(script, null);
            if (!pyRes.length) result = stringify("脚本没有返回");
            else {
              const v =
                typeof pyRes[0] === "string"
                  ? eval("(" + pyRes[0] + ")")
                  : pyRes[0];
              if (
                !v?.result ||
                (!v?.score && v?.score !== 0) ||
                Number(v?.score) < 0 ||
                Number(v?.score) > 100
              )
                result = stringify("脚本返回格式有误");
              else {
                score = Number(v.score);
                result = stringify(v.result);
              }
            }
          } else result = stringify("尚不支持该脚本语言");
        } catch (e) {
          const msg = e && e.message ? e.message : e.toString();
          result = stringify(msg);
        }
      }
      await QuestionBtnLogs.insert({
        uuid,
        type: btnRes.type,
        sheet: file_sheet,
        score,
        result,
        cos_id: file_id,
        question_btn_uuid,
        question_uuid: btnRes.question_uuid,
        question_type: qRes.type,
        contest_uuid,
        contest_direction_uuid,
        creator_id: userId,
        created_at: new Date(),
      });
      await QuestionBtnLogDatas.insert({
        data: stringify(params1),
        question_btn_log_uuid: uuid,
        creator_id: userId,
        created_at: new Date(),
      });
    } else {
      await QuestionBtnLogs.insert({
        uuid,
        type: btnRes.type,
        result: stringify(file_name),
        cos_id: file_id,
        question_btn_uuid,
        question_uuid: btnRes.question_uuid,
        question_type: qRes.type,
        contest_uuid,
        contest_direction_uuid,
        creator_id: userId,
        created_at: new Date(),
      });
    }
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },

  fuwuScoreIndex: async (ctx) => {
    const { page = 1, page_size = 20, status } = ctx.request.query;
    const currentPage = Number(page);
    const pageSize = Number(page_size);
    const userId = ctx.state.userInfo.id;
    const allArr = [];
    const keyArr = [];
    const res = [];
    const qRes = await Questions.select(
      "id",
      "uuid",
      "name",
      "description",
      "key",
      "cover_ids",
      "difficulty"
    )
      .where({ type: 2, deleted_at: null })
      .whereNot({ status: 3 })
      .whereJsonObject("evaluator_ids", [userId]);
    for (const qItem of qRes) {
      qItem.covers = [];
      for (const qSubItem of qItem.cover_ids || []) {
        const cRes = await COS.first("name", "url").where({ id: qSubItem });
        if (cRes) qItem.covers.push(cRes);
      }
      qItem.cover_url = qItem.covers[0]?.url || "";
      const qBtnRes = await QuestionBtns.select(
        "id",
        "uuid",
        "name",
        "key",
        "label",
        "desc"
      ).where({
        status: 1,
        type: 2,
        question_uuid: qItem.uuid,
        deleted_at: null,
      });
      for (const qBtnItem of qBtnRes) {
        const logRes = await QuestionBtnLogs.select(
          "uuid",
          "cos_id",
          "contest_uuid",
          "contest_direction_uuid",
          "creator_id",
          "created_at"
        ).where({
          type: 2,
          question_btn_uuid: qBtnItem.uuid,
          question_uuid: qItem.uuid,
          question_type: 2,
        });
        for (const logItem of logRes) {
          const [cos, contest, direction, creator, qAction] = await Promise.all(
            [
              COS.first("uuid", "name", "url").where({ id: logItem.cos_id }),
              Contests.first("uuid", "name").where({
                uuid: logItem.contest_uuid,
              }),
              ContestDirections.first("uuid", "name").where({
                uuid: logItem.contest_direction_uuid,
              }),
              User.first("id", "name").where({ id: logItem.creator_id }),
              ChallengeActions.first("status").where({
                contest_uuid: logItem.contest_uuid,
                contest_direction_uuid: logItem.contest_direction_uuid,
                question_uuid: qItem.uuid,
                creator_id: logItem.creator_id,
              }),
            ]
          );
          if (qAction?.status === 2) {
            allArr.push({
              uuid: logItem.uuid,
              cos,
              creator,
              created_at: formatTime(logItem.created_at),
              contest,
              direction,
              btn: {
                id: qBtnItem.id,
                uuid: qBtnItem.uuid,
                name: qBtnItem.name,
                key: qBtnItem.key,
                label: qBtnItem.label,
                desc: qBtnItem.desc,
              },
              question: {
                id: qItem.id,
                uuid: qItem.uuid,
                name: qItem.name,
                description: qItem.description,
                key: qItem.key,
                covers: qItem.covers,
                cover_url: qItem.cover_url,
                difficulty: qItem.difficulty,
              },
            });
          }
        }
      }
    }
    allArr.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return 0;
    });
    for (const aItem of allArr) {
      const key = `${aItem.creator.id}|${aItem.contest.uuid}|${aItem.direction.uuid}|${aItem.question.uuid}`;
      const index = keyArr.indexOf(key);
      if (index === -1) {
        keyArr.push(key);
        res.push({
          creator: aItem.creator,
          contest: aItem.contest,
          direction: aItem.direction,
          question: aItem.question,
          logs: [
            {
              uuid: aItem.uuid,
              cos: aItem.cos,
              created_at: aItem.created_at,
              btn: aItem.btn,
            },
          ],
        });
      } else {
        res[index].logs.push({
          uuid: aItem.uuid,
          cos: aItem.cos,
          created_at: aItem.created_at,
          btn: aItem.btn,
        });
      }
    }
    for (const item of res) {
      const sRes = await QuestionScores.first().where({
        contest_uuid: item.contest.uuid,
        contest_direction_uuid: item.direction.uuid,
        question_uuid: item.question.uuid,
        user_id: item.creator.id,
        deleted_at: null,
      });
      if (!sRes) item.status = 1;
      else {
        item.status = sRes.status;
        item.score = sRes;
      }
    }
    const r1 = res.filter(
      (i) => i.status === 1 || i.score.creator_id === userId
    );
    const len = r1.length;
    const len1 = r1.filter((i) => i.status === 1).length;
    const len2 = r1.filter((i) => i.status === 2).length;
    const len3 = r1.filter((i) => i.status === 3).length;
    const r2 = status ? r1.filter((i) => i.status === Number(status)) : r1;
    const r = [];
    for (let i = 0; i < r2.length; i += pageSize) {
      r.push(r2.slice(i, i + pageSize));
    }
    ctx.state.code = 200;
    ctx.state.data.list = r[currentPage - 1] ?? [];
    ctx.state.data.pagination = {
      current_page: currentPage,
      per_page: pageSize,
      total: r2.length,
      len,
      len1,
      len2,
      len3,
    };
  },
  fuwuScoreLock: async (ctx) => {
    const { contest_uuid, contest_direction_uuid, question_uuid, creator_id } =
      ctx.request.body;
    const userId = ctx.state.userInfo.id;
    const uuid = nanoid(8);
    if (
      !contest_uuid ||
      !contest_direction_uuid ||
      !question_uuid ||
      !creator_id
    ) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }

    const aRes = await ChallengeActions.first("status").where({
      contest_uuid,
      contest_direction_uuid,
      question_uuid,
      creator_id,
    });
    if (!aRes || aRes.status !== 2) {
      ctx.state.code = 0;
      ctx.state.data.message = "该赛题已重新挑战，处于提交流程，无法评分";
      return;
    }

    const res = await QuestionScores.first("id", "status", "creator_id").where({
      contest_uuid,
      contest_direction_uuid,
      question_uuid,
      user_id: creator_id,
    });
    const sRes = await QuestionScores.first("id").where({
      status: 2,
      creator_id: userId,
      deleted_at: null,
    });
    if (sRes && (!res || res.id !== sRes.id)) {
      ctx.state.code = 0;
      ctx.state.data.message = "请先释放或提交已领取的作品";
      return;
    }
    if (!res) {
      await QuestionScores.insert({
        uuid,
        contest_uuid,
        contest_direction_uuid,
        question_uuid,
        user_id: creator_id,
        status: 2,
        creator_id: userId,
        created_at: new Date(),
      });
      ctx.state.code = 200;
      ctx.state.data.message = "success";
    } else if (res.status === 1) {
      await QuestionScores.update(res.id, {
        status: 2,
        creator_id: userId,
        created_at: new Date(),
      });
      ctx.state.code = 200;
      ctx.state.data.message = "success";
    } else if (res.status === 2) {
      if (res.creator_id === userId) {
        ctx.state.code = 200;
        ctx.state.data.message = "success";
      } else {
        ctx.state.code = 0;
        ctx.state.data.message = "该作品已被领取";
        return;
      }
    } else if (res.status === 3) {
      ctx.state.code = 0;
      ctx.state.data.message = "该作品已评价完成";
      return;
    }
  },
  fuwuScoreRelease: async (ctx) => {
    const { contest_uuid, contest_direction_uuid, question_uuid, creator_id } =
      ctx.request.body;
    const userId = ctx.state.userInfo.id;
    if (
      !contest_uuid ||
      !contest_direction_uuid ||
      !question_uuid ||
      !creator_id
    ) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const res = await QuestionScores.first("id", "status", "creator_id").where({
      contest_uuid,
      contest_direction_uuid,
      question_uuid,
      user_id: creator_id,
      deleted_at: null,
    });
    if (!res) {
      ctx.state.code = 0;
      ctx.state.data.message = "该记录已不存在，无法释放";
      return;
    }
    if (res.status !== 2) {
      ctx.state.code = 0;
      ctx.state.data.message = "只有状态处于评价中的作品才可释放";
      return;
    }
    if (res.creator_id !== userId) {
      ctx.state.code = 0;
      ctx.state.data.message = "不是自己领取的作品，无法释放";
      return;
    }
    await QuestionScores.update(res.id, {
      status: 1,
      creator_id: null,
      created_at: null,
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
  fuwuScoreSubmit: async (ctx) => {
    const {
      contest_uuid,
      contest_direction_uuid,
      question_uuid,
      creator_id,
      score,
      dimension_scores,
      review_status,
      comment,
    } = ctx.request.body;
    const userId = ctx.state.userInfo.id;
    if (
      !contest_uuid ||
      !contest_direction_uuid ||
      !question_uuid ||
      !creator_id ||
      !score ||
      !dimension_scores ||
      !review_status ||
      !comment
    ) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const res = await QuestionScores.first("id", "status", "creator_id").where({
      contest_uuid,
      contest_direction_uuid,
      question_uuid,
      user_id: creator_id,
      deleted_at: null,
    });
    if (!res) {
      ctx.state.code = 0;
      ctx.state.data.message = "该记录已不存在，无法评价";
      return;
    }
    if (res.status !== 2) {
      ctx.state.code = 0;
      ctx.state.data.message = "只有状态处于评价中的作品才可评价";
      return;
    }
    if (res.creator_id !== userId) {
      ctx.state.code = 0;
      ctx.state.data.message = "不是自己领取的作品，无法评价";
      return;
    }
    await QuestionScores.update(res.id, {
      status: 3,
      score,
      dimension_scores: stringify(dimension_scores),
      review_status,
      comment,
      editor_id: userId,
      updated_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data.message = "success";
  },
};

module.exports = questionController;
