const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Store = require("./Store");
const Customer = require("./Customer");

const Device = sequelize.define("Device", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    imei: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    manufacturer: { type: DataTypes.STRING, allowNull: false },
    purchase_date: { type: DataTypes.DATE, allowNull: false },
}, {
    timestamps: false // Отключаем временные метки, если не нужны
});

Store.hasMany(Device, { foreignKey: "store_id" });
Device.belongsTo(Store, { foreignKey: "store_id" });

Customer.hasMany(Device, { foreignKey: "customer_id" });
Device.belongsTo(Customer, { foreignKey: "customer_id" });

module.exports = Device;
