const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const RepairStatus = require("./RepairStatus");
const SparePart = require("./SparePart");

const RepairPart = sequelize.define("RepairPart", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName:"repair_parts",
    timestamps: false // Отключаем временные метки, если не нужны
});

RepairStatus.hasMany(RepairPart, { foreignKey: "repair_status_id", onDelete: "CASCADE" });
RepairPart.belongsTo(RepairStatus, { foreignKey: "repair_status_id" });

SparePart.hasMany(RepairPart, { foreignKey: "spare_part_id", onDelete: "CASCADE" });
RepairPart.belongsTo(SparePart, { foreignKey: "spare_part_id" });

module.exports = RepairPart;
