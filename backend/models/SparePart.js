const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const SparePart = sequelize.define("SparePart", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    manufacturer: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock_quantity: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: "spare_parts",
    timestamps: false // Отключаем временные метки, если не нужны
});

module.exports = SparePart;
