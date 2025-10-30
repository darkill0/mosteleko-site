const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Device = require("./Device");
const Customer = require("./Customer");
const Store = require("./Store");
const Employee = require("./Employee");

const WarrantyCase = sequelize.define("WarrantyCase", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    issue_description: { type: DataTypes.TEXT, allowNull: false },
    status: {
        type: DataTypes.ENUM("Открыто", "В обработке", "Закрыто"),
        defaultValue: "Открыто"
    },
}, {
    tableName: "warranty_cases",
    timestamps: false // Отключаем временные метки, если не нужны
});

Device.hasMany(WarrantyCase, { foreignKey: "device_id" });
WarrantyCase.belongsTo(Device, { foreignKey: "device_id" });

Customer.hasMany(WarrantyCase, { foreignKey: "customer_id" });
WarrantyCase.belongsTo(Customer, { foreignKey: "customer_id" });

Store.hasMany(WarrantyCase, { foreignKey: "store_id" });
WarrantyCase.belongsTo(Store, { foreignKey: "store_id" });

Employee.hasMany(WarrantyCase, { foreignKey: "employee_id" });
WarrantyCase.belongsTo(Employee, { foreignKey: "employee_id" });

module.exports = WarrantyCase;
