const fs = require('fs');
const path = require('path');

module.exports.setAndGet = (sequelize) => {
  const models = {};
  fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== 'index.js')
    .forEach((file) => {
      const model = sequelize.import(path.join(__dirname, file));
      models[model.name] = model;
    });
  Object.keys(models).forEach((modelName) => {
    if ('associate' in models[modelName]) {
      models[modelName].associate(models);
    }
  });
  return models;
};
