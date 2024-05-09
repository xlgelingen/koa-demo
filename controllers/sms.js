const tencentcloud = require("tencentcloud-sdk-nodejs-sms");
const configs = require("../config");
const SMSCode = require("../models/sms_code");
const { nanoid } = require("../utils/nanoid");
const { stringify } = require("../utils/tool");
const { randomString } = require("../utils/random");

const SMSClient = tencentcloud.sms.v20210111.Client;
const Client = new SMSClient({
  credential: {
    secretId: configs.SMS_SECRETID,
    secretKey: configs.SMS_SECRETKEY,
  },
  region: configs.SMS_REGION,
});

const smsController = {
  sendCode: async (ctx) => {
    const phone_number = ctx.request.body.phone_number;
    const code = randomString(6, "0123456789");
    const min = 5;
    if (!phone_number) {
      ctx.state.code = 0;
      ctx.state.data.message = "手机号不能为空";
      return;
    }
    const params = {
      SmsSdkAppId: configs.SMS_APPID,
      SignName: configs.SMS_CODE_SIGNNAME,
      TemplateId: configs.SMS_CODE_TEMPLATEID,
      TemplateParamSet: [code, String(min)],
      PhoneNumberSet: [`+86${phone_number}`],
    };
    const res = await Client.SendSms(params);
    await SMSCode.insert({
      uuid: nanoid(8),
      phone_number,
      code,
      min,
      app_id: configs.SMS_APPID,
      sign_name: configs.SMS_CODE_SIGNNAME,
      template_id: configs.SMS_CODE_TEMPLATEID,
      region: configs.SMS_REGION,
      res: stringify(res),
      created_at: new Date(),
    });

    if (res?.SendStatusSet?.[0]?.Code === "Ok") {
      ctx.state.code = 200;
      ctx.state.data.message = "success";
    } else {
      ctx.state.code = 0;
      ctx.state.data.message =
        res?.SendStatusSet?.[0]?.Message || "腾讯云 SMS 结构返回有误";
    }
  },
};

module.exports = smsController;
