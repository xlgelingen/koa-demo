const Base = require("./base");

class SMSCode extends Base {
  constructor(props = "sms_code") {
    super(props);
  }
}

module.exports = new SMSCode();
