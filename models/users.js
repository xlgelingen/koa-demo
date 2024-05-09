const Base = require("./base");

class Users extends Base {
  constructor(props = "users") {
    super(props);
  }
}

module.exports = new Users();
