const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Supplier = sequelize.define("Supplier", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    contact_person: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
}, {
    timestamps: false // Отключаем временные метки, если не нужны
});

module.exports = Supplier;
