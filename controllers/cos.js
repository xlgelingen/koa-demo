const crypto = require("crypto");
const configs = require("../config");
const COS = require("../models/cos");
const { randomString } = require("../utils/random");

const cosController = {
  insert: async (ctx) => {
    const {
      uuid,
      name,
      size,
      mime_type,
      extension,
      bucket,
      region,
      space,
      folder,
      path,
      url,
      secret_id,
    } = ctx.request.body;
    if (!uuid) {
      ctx.state.code = 0;
      ctx.state.data.message = "缺少必要参数";
      return;
    }
    const res = await COS.insert({
      uuid,
      name,
      size,
      mime_type,
      extension,
      bucket,
      region,
      space,
      folder,
      path,
      url,
      secret_id,
      creator_id: ctx.state.userInfo.id,
      created_at: new Date(),
    });
    ctx.state.code = 200;
    ctx.state.data = {
      id: res[0],
      name,
      url,
    };
  },
  config: async (ctx) => {
    const secretId = configs.COS_SECRETID;
    const secretKey = configs.COS_SECRETKEY;
    const now = Date.now();
    const startTimestamp = Math.floor(now / 1000);
    const endTimestamp = startTimestamp + 60;
    const keyTime = `${startTimestamp};${endTimestamp}`;
    const expiration = new Date(now + 60 * 1000).toISOString();
    const policy = JSON.stringify({
      expiration,
      conditions: [
        { "q-sign-algorithm": "sha1" },
        { "q-ak": secretId },
        { "q-sign-time": keyTime },
      ],
    });
    const signKey = crypto
      .createHmac("sha1", secretKey)
      .update(keyTime)
      .digest("hex");
    const stringToSign = crypto.createHash("sha1").update(policy).digest("hex");
    const signature = crypto
      .createHmac("sha1", signKey)
      .update(stringToSign, "utf8")
      .digest("hex");

    ctx.state.code = 200;
    ctx.state.data = {
      policy: Buffer.from(policy).toString("base64"),
      secretId,
      keyTime,
      signature,
      bucket: configs.COS_BUCKET,
      region: configs.COS_REGION,
      uuid: randomString(8),
    };
  },
};

module.exports = cosController;
