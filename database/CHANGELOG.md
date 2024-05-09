# Changelog

`max` 遵循 [Semantic Versioning 2.0.0](http://semver.org/lang/zh-CN/) 语义化版本规范。

---

## 1.1.0

### Added

```sql
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
```

## 1.0.0

### Added

```sql
CREATE TABLE `enums` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(64) NOT NULL DEFAULT '' COMMENT '枚举类型',
  `label` varchar(64) NOT NULL DEFAULT '' COMMENT '文本',
  `value` int(11) NOT NULL DEFAULT 0 COMMENT '数值',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  PRIMARY KEY (`id`)
) COMMENT '枚举';

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
  `types` json DEFAULT NULL COMMENT '类型',
  `user_id` int(11) DEFAULT NULL COMMENT '关联用户',
  `creator_id` int(11) DEFAULT NULL COMMENT '创建者 ID',
  `editor_id` int(11) DEFAULT NULL COMMENT '最近编辑者 ID',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最近更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`)
) COMMENT '导师';

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
```

### Changed

```sql
ALTER TABLE `users`
  ADD COLUMN `type` int(11) DEFAULT NULL COMMENT '身份(1: 学员; 2: 导师; 3: 管理)' AFTER `role`,
  ADD COLUMN `reg_type` int(11) DEFAULT NULL COMMENT '注册身份(1: 学员; 2: 导师)' AFTER `type`,
  DROP COLUMN `registration_role`;

ALTER TABLE `questions`
  ADD COLUMN `description` text COMMENT '赛题描述' AFTER `name`,
  ADD COLUMN `cover_ids` json DEFAULT NULL COMMENT '封面图片' AFTER `type`,
  ADD COLUMN `difficulty`int(11) DEFAULT 0 COMMENT '难度(1~5)' AFTER `cover_ids`,
  ADD COLUMN `tag` int(11) DEFAULT 0 COMMENT '标签(1: 少年营)' AFTER `exp`,
  ADD COLUMN `category` int(11) DEFAULT NULL COMMENT '类别(1: 学术问题; 2: 企业问题; 3: 创新创业)' AFTER `tag`,
  ADD COLUMN `status` int(11) DEFAULT 1 COMMENT '状态(1: 上架; 2: 隐藏; 3: 下架)' AFTER `category`,
  ADD COLUMN `subject` json DEFAULT NULL COMMENT '学科' AFTER `status`,
  ADD COLUMN `mentors` json DEFAULT NULL COMMENT '关联导师(对象数组, 属性有 mentor_type、mentor_ids)' AFTER `subject`,
  ADD COLUMN `challenge_domain_ids` json DEFAULT NULL COMMENT '关联领域' AFTER `mentors`,
  MODIFY COLUMN `desc` text COMMENT '简介',
  DROP COLUMN `cover_url`;

ALTER TABLE `contests`
  ADD COLUMN `description` varchar(255) DEFAULT NULL COMMENT '比赛描述' AFTER `name`,
  ADD COLUMN `subtitle` varchar(64) DEFAULT NULL COMMENT '副标题' AFTER `description`,
  ADD COLUMN `cover_id` int(11) DEFAULT NULL COMMENT '封面 COS ID' AFTER `desc`,
  DROP COLUMN `image_url`;
```

### Deleted

```sql
DROP TABLE IF EXISTS `question_locks`;
```
