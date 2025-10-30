const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const User = sequelize.define(
    "User",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        login: { type: DataTypes.STRING, allowNull: false, unique: true },
        password_hash: { type: DataTypes.STRING, allowNull: false },
        role: {
            type: DataTypes.ENUM("Менеджер", "Администратор"),
            allowNull: false
        },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    },
    {
        tableName: "users",
        timestamps: false
    }
);

module.exports = User;
