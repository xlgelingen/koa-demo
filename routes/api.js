const router = require("koa-router")({
  prefix: "/api",
});

const authController = require("../controllers/auth");
const userController = require("../controllers/user");
const roleController = require("../controllers/role");
const cosController = require("../controllers/cos");
const questionController = require("../controllers/question");
const contestController = require("../controllers/contest");
const dimensionController = require("../controllers/question_score_dimension");
const smsController = require("../controllers/sms");
const enumController = require("../controllers/enum");
const mentorController = require("../controllers/mentor");
const challengeController = require("../controllers/challenge");

const auth = require("../middlewares/auth");
const permission = (p) => (ctx, next) => auth.permission(ctx, next, p);

router.post("/auth/login", authController.login);
router.post("/auth/signup", authController.signup);
router.post("/auth/admission", authController.admission);
router.post("/auth/sms-code", smsController.sendCode);

router.get("/user/info", userController.self);
router.post("/user/password", permission("common.user.password.update"), userController.commonUpdatePassword);

router.get("/cos/config", permission("common.cos.config"), cosController.config);
router.post("/cos", permission("common.cos.insert"), cosController.insert);

router.get("/enum", permission("common.enum"), enumController.getConst);
router.get("/enum/label", permission("common.enum.label"), enumController.getLabel);

router.get("/admin/users", permission("admin.user.all"), userController.adminAll);
router.get("/admin/user", permission("admin.user.index"), userController.adminIndex);
router.post("/admin/user", permission("admin,user.insert"), userController.adminInsert);
router.put("/admin/user/:id", permission("admin,user.update"), userController.adminUpdate);
router.delete("/admin/user/:id", permission("admin.user.disabled"), userController.adminDisabled);

router.get("/admin/mentors", permission("admin.mentor.all"), mentorController.adminAll);
router.get("/admin/mentor", permission("admin.mentor.index"), mentorController.adminIndex);
router.post("/admin/mentor", permission("admin.mentor.insert"), mentorController.adminInsert);
router.put("/admin/mentor/:id", permission("admin.mentor.update"), mentorController.adminUpdate);
router.delete("/admin/mentor/:id", permission("admin.mentor.delete"), mentorController.adminDelete);

router.get("/admin/role/tabs", permission("admin.role.tabs"), roleController.adminTabs);
router.get("/admin/roles", permission("admin.role.all"), roleController.adminAll);
router.get("/admin/role", permission("admin.role.index"), roleController.adminIndex);
router.post("/admin/role", permission("admin.role.insert"), roleController.adminInsert);
router.get("/admin/role/:id", permission("admin.role.show"), roleController.adminShow);
router.put("/admin/role/:id", permission("admin.role.update"), roleController.adminUpdate);
router.delete("/admin/role/:id", permission("admin.role.delete"), roleController.adminDelete);

router.get("/admin/contest", permission("admin.contest.index"), contestController.adminIndex);
router.post("/admin/contest", permission("admin.contest.insert"), contestController.adminInsert);
router.put("/admin/contest/:id", permission("admin.contest.update"), contestController.adminUpdate);
router.delete("/admin/contest/:id", permission("admin.contest.delete"), contestController.adminDelete);
router.get(
  "/admin/contest/:id/direction", permission("admin.contest.direction.index"), contestController.adminDirectionIndex
);
router.post(
  "/admin/contest/:id/direction", permission("admin.contest.direction.insert"), contestController.adminDirectionInsert
);
router.put(
  "/admin/contest-direction/:id", permission("admin.contest.direction.update"), contestController.adminDirectionUpdate
);
router.delete(
  "/admin/contest-direction/:id", permission("admin.contest.direction.delete"), contestController.adminDirectionDelete
);
router.get("/admin/questions", permission("admin.question.all"), questionController.adminAll);
router.get("/admin/question", permission("admin.question.index"), questionController.adminIndex);
router.post("/admin/question", permission("admin.question.insert"), questionController.adminInsert);
router.put("/admin/question/:id", permission("admin.question.update"), questionController.adminUpdate);
router.put("/admin/question/:id/users", permission("admin.question.update.users"), questionController.adminUpdateUsers);
router.put(
  "/admin/question/:id/evaluators",
  permission("admin.question.update.evaluators"),
  questionController.adminUpdateEvaluators
);
router.delete("/admin/question/:id", permission("admin.question.delete"), questionController.adminDelete);
router.get("/admin/question-btn", permission("admin.question.btn.index"), questionController.adminBtnIndex);
router.post("/admin/question-btn", permission("admin.question.btn.insert"), questionController.adminBtnInsert);
router.put("/admin/question-btn/:id", permission("admin.question.btn.update"), questionController.adminBtnUpdate);
router.delete("/admin/question-btn/:id", permission("admin.question.btn.delete"), questionController.adminBtnDelete);
router.get("/admin/question-btn/:id", permission("admin.question.btn.show"), questionController.adminBtnShow);
router.post("/admin/question-btn/:id", permission("admin.question.btn.show.update"), questionController.adminBtnShowUpdate);
router.post("/admin/question-btn/:id/test", permission("admin.question.btn.show.test"), questionController.adminBtnShowTest);
router.get("/admin/question-btn-log", permission("admin.question.btn.log.index"), questionController.adminBtnLogIndex);
router.get(
  "/admin/question-btn-log-data",
  permission("admin.question.btn.log.data.index"),
  questionController.adminBtnLogDataIndex
);
router.get(
  "/admin/question-score-dimension", permission("admin.question.score.dimension.index"), dimensionController.adminIndex
);
router.post(
  "/admin/question-score-dimension", permission("admin.question.score.dimension.insert"), dimensionController.adminInsert
);
router.put(
  "/admin/question-score-dimension/:id", permission("admin.question.score.dimension.update"), dimensionController.adminUpdate
);
router.delete(
  "/admin/question-score-dimension/:id", permission("admin.question.score.dimension.delete"), dimensionController.adminDelete
);
router.get(
  "/admin/challenge/domains", permission("admin.challenge.domain.all"), challengeController.adminDomainAll
);
router.get(
  "/admin/challenge/domain", permission("admin.challenge.domain.index"), challengeController.adminDomainIndex
);
router.post(
  "/admin/challenge/domain", permission("admin.challenge.domain.insert"), challengeController.adminDomainInsert
);
router.put(
  "/admin/challenge/domain/:id", permission("admin.challenge.domain.update"), challengeController.adminDomainUpdate
);
router.delete(
  "/admin/challenge/domain/:id", permission("admin.challenge.domain.delete"), challengeController.adminDomainDelete
);

router.get("/xc/contests", permission("xc.contest.all"), contestController.xcAll);
router.get("/xc/contest/:id", permission("xc.contest.show"), contestController.xcShow);
router.get("/xc/questions", permission("xc.question.all"), questionController.xcAll);
router.get("/xc/question/:id", permission("xc.question.show"), questionController.xcShow);
router.put("/xc/action", permission("xc.action"), challengeController.xcAction);
router.post("/xc/run", permission("xc.question.run"), questionController.xcRun);

router.get("/fuwu/question/score", permission("fuwu.question.score.index"), questionController.fuwuScoreIndex);
router.put("/fuwu/question/score/lock", permission("fuwu.question.score.lock"), questionController.fuwuScoreLock);
router.put("/fuwu/question/score/release", permission("fuwu.question.score.release"), questionController.fuwuScoreRelease);
router.put("/fuwu/question/score/submit", permission("fuwu.question.score.submit"), questionController.fuwuScoreSubmit);
router.get("/fuwu/question-score-dimensions", permission("fuwu.question.score.dimension.all"), dimensionController.fuwuAll);

router.get("/my/user/info", permission("my.user.info.show"), userController.myShowInfo);
router.put("/my/user/info", permission("my.user.info.update"), userController.myUpdateInfo);

module.exports = router;
