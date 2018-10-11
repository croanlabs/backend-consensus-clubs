const config = require('../config');
const eos = require('../config/eos');

const exp = module.exports;

/**
 * Get a row by id.
 *
 */
exp.getRowById = (tableName, id) => eos
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
  .then((res) => {
    if (res.rows.length) {
      return res.rows[0];
    }
    return null;
  });

/**
 * Query table using index value.
 *
 */
exp.getRowsUsingIndex = (tableName, id, indexId) => eos
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
  .then(res => res.rows);

/**
 * Get paged results from table.
 *
 */
exp.getPagedResults = (tableName, idFrom, options = {}) => {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const indexId = options.indexId || 1;
  return eos.getTableRows(
    true,
    config.eosUsername,
    config.eosUsername,
    tableName,
    '',
    idFrom + (page - 1) * pageSize,
    -1,
    pageSize,
    'i64',
    indexId,
  );
};
