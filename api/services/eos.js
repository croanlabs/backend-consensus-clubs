const config = require('../config');
const eos = require('../config/eos');

let exp = module.exports;

exp.getRowById = (tableName, id) => {
  return eos.getTableRows(
    true,
    config.eosUsername,
    config.eosUsername,
    tableName,
    'primary_key',
    id, // lower bound
    id + 1, // upper bound
    1, // limit
    'i64',
    1,
  );
};
