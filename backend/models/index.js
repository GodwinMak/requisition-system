const dbConfig = require("../config/dbConfig.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.js")(sequelize, DataTypes);
db.materialCategory = require("./materialCategory.js")(sequelize, DataTypes);
db.stock = require("./stock.js")(sequelize, DataTypes);
db.requisition = require("./requisition.js")(sequelize, DataTypes);

// Define associations
db.materialCategory.hasMany(db.stock, { foreignKey: "material_category_id" });
db.stock.belongsTo(db.materialCategory, { foreignKey: "material_category_id" });

db.sequelize
  .sync({ force: false })
  .then(() => {})
  .then(() => {
    console.log("Yes re-sync done.");
  });

module.exports = db;