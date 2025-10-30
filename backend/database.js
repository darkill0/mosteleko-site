const { Sequelize } = require("sequelize");
require("dotenv").config();


const sequelize = new Sequelize(
    "warranty_service",
    "sa",
    "123",
    {
        dialect: "mssql",
        host: "localhost", // Указываем SERVER вместо HOST
        port: process.env.DB_PORT || 1433,
        logging: false,
        dialectOptions: {
            options: {
                encrypt: false, // Отключаем шифрование для локального сервера
                enableArithAbort: true,
                trustServerCertificate: true, // Если есть проблемы с SSL
            },
        },
    }
);




module.exports = sequelize;
