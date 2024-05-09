const knex = require("./knex");

class Base {
  constructor(props) {
    this.table = props;
  }
  knex() {
    return knex(this.table);
  }
  count() {
    return knex(this.table).count("* as count").first();
  }
  distinct(...params) {
    return knex(this.table).distinct(...params);
  }
  select(...params) {
    return knex(this.table).select(...params);
  }
  first(...params) {
    return knex(this.table).first(...params);
  }
  insert(params) {
    return knex(this.table).insert(params);
  }
  batchInsert(rows, chunkSize) {
    return knex.batchInsert(this.table, rows, chunkSize);
  }
  update(id, params) {
    return knex(this.table).where({ id }).update(params);
  }
  delete(id) {
    return knex(this.table).where({ id }).del();
  }
}

module.exports = Base;
