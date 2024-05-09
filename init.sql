-- ----------------------------
-- Table structure for enums
-- ----------------------------
DROP TABLE IF EXISTS `enums`;
CREATE TABLE `enums` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(64) NOT NULL DEFAULT '' COMMENT '枚举类型',
  `label` varchar(64) NOT NULL DEFAULT '' COMMENT '文本',
  `value` int(11) NOT NULL DEFAULT 0 COMMENT '数值',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  PRIMARY KEY (`id`)
) COMMENT '枚举';
-- ----------------------------
-- Records of enums
-- ----------------------------
BEGIN;
INSERT INTO `enums` (`id`, `type`, `label`, `value`, `description`) VALUES 
(1, "user_type", "学员", 1, ""),
(2, "user_type", "导师", 2, ""),
(3, "user_type", "管理", 3, ""),
(4, "user_reg_type", "学员", 1, ""),
(5, "user_reg_type", "导师", 2, ""),
(6, "user_source", "常规新增", 1, ""),
(7, "user_source", "注册", 2, ""),
(8, "user_source", "批量导入", 3, ""),
(9, "mentor_type", "领衔导师", 1, ""),
(10, "mentor_type", "菁锐导师", 2, ""),
(11, "mentor_type", "学术助教", 3, ""),
(12, "mentor_type", "外部合作导师", 4, ""),
(13, "mentor_type", "企业合作导师", 5, ""),
(14, "sms_code_status", "等待验证", 1, ""),
(15, "sms_code_status", "已验证", 2, ""),
(16, "question_type", "邀请制", 1, ""),
(17, "question_type", "公开制", 2, ""),
(18, "question_tag", "少年营", 1, ""),
(19, "question_category", "学术问题", 1, ""),
(20, "question_category", "企业问题", 2, ""),
(21, "question_category", "创新创业", 3, ""),
(22, "question_status", "上架", 1, ""),
(23, "question_status", "隐藏", 2, ""),
(24, "question_status", "下架", 3, ""),
(25, "question_btn_status", "已关闭", 0, ""),
(26, "question_btn_status", "已开启", 1, ""),
(27, "question_btn_type", "榜单", 1, ""),
(28, "question_btn_type", "附件", 2, ""),
(29, "question_btn_lang", "Javascript", 1, ""),
(30, "question_btn_lang", "Python", 2, ""),
(31, "contest_status", "未开始", 1, ""),
(32, "contest_status", "开放中", 2, ""),
(33, "contest_status", "已结束", 3, ""),
(34, "contest_direction_status", "不开放", 0, ""),
(35, "contest_direction_status", "开放", 1, ""),
(36, "question_score_status", "未评价", 1, ""),
(37, "question_score_status", "评价中", 2, ""),
(38, "question_score_status", "已评价", 3, ""),
(39, "question_score_review_status", "通过", 1, ""),
(40, "question_score_review_status", "待定", 2, ""),
(41, "question_score_review_status", "不通过", 3, ""),
(42, "challenge_action_status", "未参与", 1, ""),
(43, "challenge_action_status", "挑战中", 2, ""),
(44, "challenge_action_status", "已完成", 3, "");
COMMIT;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '' COMMENT '用户姓名',
  `avatar_id` int(11) DEFAULT NULL COMMENT '头像 COS ID',
  `account_number` varchar(64) NOT NULL COMMENT '账号',
  `phone_number` varchar(64) DEFAULT NULL COMMENT '手机号',
  `email` varchar(64) DEFAULT NULL COMMENT '邮箱',
  `address` varchar(255) DEFAULT NULL COMMENT '地址',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `role` int(11) NOT NULL DEFAULT 0 COMMENT '角色',
  `type` int(11) DEFAULT NULL COMMENT '身份(1: 学员; 2: 导师; 3: 管理)',
  `reg_type` int(11) DEFAULT NULL COMMENT '注册身份(1: 学员; 2: 导师)',
  `source` int(11) NOT NULL DEFAULT 1 COMMENT '数据来源(1: 常规新增; 2: 注册; 3: 批量导入)',
  `is_disabled` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否禁用',
  `token` text COMMENT '登录 token',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '用户';

-- ----------------------------
-- Table structure for mentors
-- ----------------------------
DROP TABLE IF EXISTS `mentors`;
CREATE TABLE `mentors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `name` varchar(64) NOT NULL COMMENT '导师名称',
  `avatar_id` int(11) DEFAULT NULL COMMENT '导师头像 COS ID',
  `description` text COMMENT '导师描述',
  `intro` text COMMENT '导师简介',
  `homepage` varchar(255) DEFAULT NULL COMMENT '导师主页',
  `title` varchar(64) DEFAULT NULL COMMENT '头衔',
  `tag` varchar(64) DEFAULT NULL COMMENT '标签',
  `types` json DEFAULT NULL COMMENT '类型(1: 领衔导师; 2: 菁锐导师; 3: 学术助教; 4: 外部合作导师; 5: 企业合作导师)',
  `user_id` int(11) DEFAULT NULL COMMENT '关联用户',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最近更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '导师';

-- ----------------------------
-- Table structure for cos
-- ----------------------------
DROP TABLE IF EXISTS `cos`;
CREATE TABLE `cos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `name` varchar(255) DEFAULT NULL COMMENT '文件名称',
  `size` double DEFAULT NULL COMMENT '文件的大小',
  `mime_type` varchar(255) DEFAULT NULL COMMENT '文件的 MIME 类型',
  `extension` varchar(255) DEFAULT NULL COMMENT '文件的扩展名',
  `bucket` varchar(255) DEFAULT NULL COMMENT '对象存储服务中的存储桶或容器',
  `region` varchar(255) DEFAULT NULL COMMENT '对象存储服务中的可用地域',
  `space` varchar(255) DEFAULT NULL COMMENT '文件存储的命名空间',
  `folder` varchar(255) DEFAULT NULL COMMENT '文件存储的目录',
  `path` varchar(255) DEFAULT NULL COMMENT '文件存储的路径',
  `url` text COMMENT '文件 URL',
  `secret_id` varchar(255) DEFAULT NULL COMMENT '身份认证凭证',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) COMMENT '腾讯云对象存储';

-- ----------------------------
-- Table structure for sms_code
-- ----------------------------
DROP TABLE IF EXISTS `sms_code`;
CREATE TABLE `sms_code` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `phone_number` varchar(64) NOT NULL COMMENT '手机号',
  `code` varchar(64) NOT NULL COMMENT '验证码',
  `min` int(11) DEFAULT 0 COMMENT '有效时间(分钟)',
  `app_id` varchar(64) NOT NULL COMMENT '短信应用 ID',
  `sign_name` varchar(64) NOT NULL COMMENT '短信签名',
  `template_id` varchar(64) NOT NULL COMMENT '短信内容模板 ID',
  `region` varchar(255) DEFAULT NULL COMMENT '地域信息',
  `res` json DEFAULT NULL COMMENT '短信返回',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '状态(0: 等待验证; 1: 已验证)',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '验证时间',
  PRIMARY KEY (`id`)
) COMMENT '腾讯云短信验证码';

-- ----------------------------
-- Table structure for challenge_domains
-- ----------------------------
DROP TABLE IF EXISTS `challenge_domains`;
CREATE TABLE `challenge_domains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `name` varchar(64) NOT NULL COMMENT '领域名称',
  `description` text COMMENT '领域描述',
  `intro` text COMMENT '领域简介',
  `direction` varchar(64) NOT NULL COMMENT '领域方向',
  `mentor_id` int(11) DEFAULT NULL COMMENT '关联导师',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最近更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '挑战领域';

-- ----------------------------
-- Table structure for challenge_actions
-- ----------------------------
DROP TABLE IF EXISTS `challenge_actions`;
CREATE TABLE `challenge_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `contest_uuid` varchar(64) NOT NULL COMMENT '比赛唯一编号',
  `contest_direction_uuid` varchar(64) NOT NULL COMMENT '比赛方向唯一编号',
  `question_uuid` varchar(64) NOT NULL COMMENT '赛题唯一编号',
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '状态(0: 未参与; 1: 挑战中 2: 已完成)',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最近更新时间',
  PRIMARY KEY (`id`)
) COMMENT '挑战赛题行为';

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `name` varchar(255) NOT NULL COMMENT '赛题名称',
  `description` text COMMENT '赛题描述',
  `key` varchar(64) NOT NULL COMMENT '唯一标识',
  `type` int(11) DEFAULT 1 COMMENT '类型(1: 邀请制; 2: 公开制)',
  `cover_ids` json DEFAULT NULL COMMENT '封面图片',
  `difficulty`int(11) DEFAULT 0 COMMENT '难度(1~5)',
  `title` varchar(64) DEFAULT NULL COMMENT '标题',
  `org` varchar(64) DEFAULT NULL COMMENT '发布机构',
  `desc` text COMMENT '简介',
  `exp` text COMMENT '说明',
  `tag` int(11) DEFAULT 0 COMMENT '标签(1: 少年营)',
  `category` int(11) DEFAULT NULL COMMENT '类别(1: 学术问题; 2: 企业问题; 3: 创新创业)',
  `status` int(11) DEFAULT 1 COMMENT '状态(1: 上架; 2: 隐藏; 3: 下架)',
  `subject` json DEFAULT NULL COMMENT '学科',
  `mentors` json DEFAULT NULL COMMENT '关联导师(对象数组, 属性有 mentor_type、mentor_ids)',
  `challenge_domain_ids` json DEFAULT NULL COMMENT '关联领域',
  `user_ids` json DEFAULT NULL COMMENT '参赛者',
  `evaluator_ids` json DEFAULT NULL COMMENT '评分者',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '赛题';

-- ----------------------------
-- Table structure for question_btns
-- ----------------------------
DROP TABLE IF EXISTS `question_btns`;
CREATE TABLE `question_btns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `name` varchar(64) NOT NULL COMMENT '名称',
  `key` varchar(64) NOT NULL COMMENT '唯一标识',
  `label` varchar(64) NOT NULL COMMENT '按钮内文字',
  `desc` varchar(255) DEFAULT NULL COMMENT '描述',
  `status` int(11) DEFAULT 0 COMMENT '状态(0: 已关闭; 1: 已开启)',
  `type` int(11) DEFAULT 0 COMMENT '类型(1: 榜单; 2: 附件)',
  `lang` int(11) DEFAULT 0 COMMENT '榜单类型脚本语言(1: Javascript; 2: Python)',
  `script` text COMMENT '榜单类型执行脚本',
  `config` json DEFAULT NULL COMMENT '其他配置',
  `question_uuid` varchar(64) NOT NULL COMMENT '赛题唯一编号',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '赛题功能按钮';

-- ----------------------------
-- Table structure for question_btn_results
-- ----------------------------
DROP TABLE IF EXISTS `question_btn_results`;
CREATE TABLE `question_btn_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `sheet` varchar(64) DEFAULT NULL COMMENT '工作表',
  `result` json DEFAULT NULL COMMENT '答案',
  `cos_id` int(11) NOT NULL COMMENT '腾讯云对象存储编号',
  `question_btn_uuid` varchar(64) NOT NULL COMMENT '赛题功能按钮唯一编号',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '赛题功能榜单类型答案管理';

-- ----------------------------
-- Table structure for question_btn_logs
-- ----------------------------
DROP TABLE IF EXISTS `question_btn_logs`;
CREATE TABLE `question_btn_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `type` int(11) DEFAULT 0 COMMENT '类型(1: 榜单; 2: 附件)',
  `score` double DEFAULT 0 COMMENT '榜单类型排行分(0-100)',
  `result` json DEFAULT NULL COMMENT '结果',
  `sheet` varchar(64) DEFAULT NULL COMMENT '工作表',
  `cos_id` int(11) NOT NULL COMMENT '腾讯云对象存储编号',
  `question_btn_uuid` varchar(64) NOT NULL COMMENT '赛题功能按钮唯一编号',
  `question_uuid` varchar(64) NOT NULL COMMENT '赛题唯一编号',
  `question_type` int(11) DEFAULT 1 COMMENT '赛题类型(1: 邀请制; 2: 公开制)',
  `contest_uuid` varchar(64) DEFAULT NULL COMMENT '比赛唯一编号',
  `contest_direction_uuid` varchar(64) DEFAULT NULL COMMENT '比赛方向唯一编号',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) COMMENT '赛题功能操作记录';

-- ----------------------------
-- Table structure for question_btn_log_datas
-- ----------------------------
DROP TABLE IF EXISTS `question_btn_log_datas`;
CREATE TABLE `question_btn_log_datas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `data` json DEFAULT NULL COMMENT '备份数据',
  `question_btn_log_uuid` varchar(64) NOT NULL COMMENT '赛题功能操作记录唯一编号',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) COMMENT '赛题功能操作记录榜单类型数据备份';

-- ----------------------------
-- Table structure for contests
-- ----------------------------
DROP TABLE IF EXISTS `contests`;
CREATE TABLE `contests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `name` varchar(255) NOT NULL COMMENT '比赛名称',
  `description` varchar(255) DEFAULT NULL COMMENT '比赛描述',
  `subtitle` varchar(64) DEFAULT NULL COMMENT '副标题',
  `desc` text COMMENT '介绍',
  `cover_id` int(11) DEFAULT NULL COMMENT '封面 COS ID',
  `order` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '状态(1: 未开始; 2: 开放中; 3: 已结束)',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最近更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '比赛';

-- ----------------------------
-- Table structure for contest_directions
-- ----------------------------
DROP TABLE IF EXISTS `contest_directions`;
CREATE TABLE `contest_directions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `name` varchar(255) NOT NULL COMMENT '比赛方向名称',
  `contest_id` int(11) NOT NULL COMMENT '所属比赛',
  `question_ids` json DEFAULT NULL COMMENT '赛题',
  `order` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '状态(0: 不开放; 1: 开放)',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最近更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '比赛方向';

-- ----------------------------
-- Table structure for question_score_dimensions
-- ----------------------------
DROP TABLE IF EXISTS `question_score_dimensions`;
CREATE TABLE `question_score_dimensions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `dimension_name` varchar(64) NOT NULL COMMENT '维度名称',
  `dimension_weight` int(11) NOT NULL DEFAULT 0 COMMENT '维度权重',
  `description` varchar(255) DEFAULT NULL COMMENT '维度描述',
  `order` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最近更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '赛题评分维度';

-- ----------------------------
-- Table structure for question_scores
-- ----------------------------
DROP TABLE IF EXISTS `question_scores`;
CREATE TABLE `question_scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `contest_uuid` varchar(64) NOT NULL COMMENT '比赛唯一编号',
  `contest_direction_uuid` varchar(64) NOT NULL COMMENT '比赛方向唯一编号',
  `question_uuid` varchar(64) NOT NULL COMMENT '赛题唯一编号',
  `user_id` int(11) NOT NULL COMMENT '提交者 ID',
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '状态(1: 未评价; 2: 评价中; 3: 已评价)',
  `score` int(11) NOT NULL DEFAULT 0 COMMENT '总得分',
  `dimension_scores` json DEFAULT NULL COMMENT '各维度得分',
  `review_status` int(11) NOT NULL DEFAULT 0 COMMENT '审阅状态(1: 通过; 2: 待定; 3: 不通过)',
  `comment` varchar(255) DEFAULT NULL COMMENT '评语',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最近更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '公开赛题评分';

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `name` varchar(64) DEFAULT NULL COMMENT '角色名称',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `platforms` json DEFAULT NULL COMMENT '平台权限',
  `permissions` json DEFAULT NULL COMMENT '权限',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最近更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '角色';
-- ----------------------------
-- Records of roles
-- ----------------------------
BEGIN;
INSERT INTO `roles` (`id`, `uuid`, `name`, `description`) VALUES 
(1, "SUPADMIN", "超级管理员", "拥有所有权限，无法编辑、删除"),
(2, "REGUSER", "注册用户", "需自行配置权限");
COMMIT;

-- ----------------------------
-- Table structure for admission_apps
-- ----------------------------
DROP TABLE IF EXISTS `admission_apps`;
CREATE TABLE `admission_apps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL COMMENT '唯一编号',
  `key` varchar(64) NOT NULL COMMENT '申请流程唯一标识',
  `name` varchar(64) NOT NULL COMMENT '姓名',
  `gender` int(11) DEFAULT 0 COMMENT '性别(1: 男; 2: 女)',
  `birthdate` varchar(64) DEFAULT NULL COMMENT '出生日期',
  `email` varchar(64) DEFAULT NULL COMMENT '邮箱',
  `phone_number` varchar(64) DEFAULT NULL COMMENT '手机号',
  `school` varchar(64) DEFAULT NULL COMMENT '所在学校',
  `faculty` varchar(64) DEFAULT NULL COMMENT '所在院系(书院、学院)',
  `major` varchar(64) DEFAULT NULL COMMENT '所在专业',
  `grade` varchar(64) DEFAULT NULL COMMENT '入学年级',
  `cls` varchar(64) DEFAULT NULL COMMENT '所在班级',
  `research_exp` int(11) DEFAULT 0 COMMENT '科研经验(1: Novice 新手; 2: Beginning 入门; 3: Advanced 高级)',
  `type` int(11) DEFAULT 0 COMMENT '类型(1: 大学营; 2: 中学营)',
  `utm_params` json DEFAULT NULL COMMENT 'UTM 参数',
  `custom_params` json DEFAULT NULL COMMENT '自定义参数',
  `user_id` int(11) NOT NULL COMMENT '用户 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) COMMENT '入学申请(预报名)';
