module.exports = (sequelize, DataTypes) => {
  return (Stock = sequelize.define("stock", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    items_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    material_category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "material_categories",
        key: "id",
      },
    },
    available_qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    balance_qty:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, 
    },
    unit_of_measure: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }));
};
