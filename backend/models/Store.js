const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Employee = require("./Employee");

const Store = sequelize.define(
    "Store",
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        location: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING(20), allowNull: false },
        manager_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Employee,
                key: "id",
            },
            onDelete: "SET NULL",
        },
    },
    {
        tableName: "stores",
        timestamps: false, // Отключаем временные метки, если не нужны
    }
);

// 🔹 Один магазин имеет одного управляющего (сотрудника)
Store.hasMany(Employee, { foreignKey: "store_id" });
Employee.belongsTo(Store, { foreignKey: "store_id" });

// Один магазин имеет одного управляющего
Store.belongsTo(Employee, { as: "manager", foreignKey: "manager_id" });

module.exports = Store;
