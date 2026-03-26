module.exports = (sequelize, DataTypes) => {
    return User = sequelize.define('user', {
        id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'procurement', 'normal', 'approver'),
            allowNull: false,
            defaultValue: 'normal',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: true,
        }
    })
}