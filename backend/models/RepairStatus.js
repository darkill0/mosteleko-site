const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const WarrantyCase = require("./WarrantyCase");
const moment = require("moment-timezone");

const RepairStatus = sequelize.define(
    "RepairStatus",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        status: {
            type: DataTypes.ENUM("Принято", "В ремонте", "Ожидает запчастей", "Отремонтировано", "Выдано клиенту"),
            allowNull: false,
        },
        comment: { type: DataTypes.TEXT },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            get() {
                // Получаем дату в формате "YYYY-MM-DD HH:mm:ss"
                return moment(this.getDataValue("updated_at")).format("YYYY-MM-DD HH:mm:ss");
            },
            set(value) {
                // Устанавливаем дату без временной зоны
                this.setDataValue("updated_at", moment(value).format("YYYY-MM-DD HH:mm:ss"));
            },
        },
        warranty_case_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
        tableName: "repair_statuses",
        timestamps: false, // Отключаем автоматические createdAt и updatedAt
    }
);


WarrantyCase.hasMany(RepairStatus, { foreignKey: "warranty_case_id", onDelete: "CASCADE" });
RepairStatus.belongsTo(WarrantyCase, { foreignKey: "warranty_case_id" });

module.exports = RepairStatus;