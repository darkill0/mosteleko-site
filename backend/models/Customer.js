const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Customer = sequelize.define("Customer", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    email: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
}, {
    timestamps: false // Отключаем временные метки, если не нужны
});
module.exports = Customer;
