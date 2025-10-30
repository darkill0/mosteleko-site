const express = require("express");
const { Op } = require("sequelize");
const Customer = require("../models/Customer");
const Device = require("../models/Device");

const router = express.Router();

/**
 * Получить всех клиентов с поддержкой пагинации и поиска
 * GET /customers?page=1&limit=10&search=Иван
 */
router.get("/", async (req, res) => {
    try {

        // Получаем клиентов с учетом условий
        const rows = await Customer.findAll({
        });
        console.log(rows);
        res.json({
            customers: rows,
            totalPages: Math.ceil(10 / 2),
            currentPage: 1,
        });
    } catch (error) {
        console.error("Ошибка при получении клиентов:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

/**
 * Получить клиента по ID
 * GET /customers/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: "Клиент не найден" });

        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Создать нового клиента
 * POST /customers
 */
router.post("/", async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ message: "Имя и телефон обязательны" });
        }

        const newCustomer = await Customer.create({ name, phone, email, address });
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Обновить данные клиента
 * PUT /customers/:id
 */
router.put("/:id", async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: "Клиент не найден" });

        await customer.update(req.body);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Удалить клиента
 * DELETE /customers/:id
 */
router.delete("/:id", async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) return res.status(404).json({ message: "Клиент не найден" });

        await customer.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Получить устройства клиента по customer_id
 * GET /customers/:id/devices
 */
router.get("/:id/devices", async (req, res) => {
    try {
        const customerId = req.params.id;
        const devices = await Device.findAll({
            where: { customer_id: customerId },
        });

        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
