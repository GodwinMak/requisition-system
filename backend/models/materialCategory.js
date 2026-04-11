module.exports = (sequelize, DataTypes) => {
    return MaterialCategory = sequelize.define('material_category', {
        id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description:{
            type: DataTypes.STRING,
            allowNull: true,
        }
    }

)}