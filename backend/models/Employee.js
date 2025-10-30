const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Employee = sequelize.define("Employee", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.STRING(100), allowNull: false },
    phone: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING },
}, {
    tableName: "employees",
    timestamps: false
});

module.exports = Employee;
