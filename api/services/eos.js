const config = require('../config');
const eos = require('../config/eos');

let exp = module.exports;

/**
 * Get a row by id.
 *
 */
exp.getRowById = (tableName, id) => {
  return eos
    .getTableRows(
      true,
      config.eosUsername,
      config.eosUsername,
      tableName,
      'primary_key',
      id, // lower bound
      id + 1, // upper bound
      1, // limit
      'i64', // index type
      1, // index correlative
    )
    .then(res => {
      if (res.rows.length) {
        return res.rows[0];
      } else {
        return null;
      }
    });
};

/**
 * Query table using index value.
 *
 */
exp.getRowsUsingIndex = (tableName, id, indexId) => {
  return eos
    .getTableRows(
      true,
      config.eosUsername,
      config.eosUsername,
      tableName,
      '',
      id, // lower bound
      id + 1, // upper bound
      10, // limit
      'i64', // index type
      indexId, // index correlative
    )
    .then(res => {
      return res.rows;
    });
};

/**
 * Get paged results from table.
 *
 */
exp.getPagedResults = (tableName, idFrom, options = {}) => {
  options.page = options.page || 1;
  options.pageSize = options.pageSize || 10;
  options.indexId = options.indexId || 1;
  return eos
    .getTableRows(
      true,
      config.eosUsername,
      config.eosUsername,
      tableName,
      '',
      idFrom + (options.page - 1) * options.pageSize,
      -1,
      options.pageSize,
      'i64',
      options.indexId,
    );
};
