const express = require("express");
const Device = require("../models/Device");
const Store = require("../models/Store");
const Customer = require("../models/Customer");

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const { customer_id, page, limit, search, manufacturer } = req.query;

        // Определяем, требуется ли пагинация и фильтрация
        const isPaginatedRequest = page || limit || search || manufacturer;

        const whereCondition = {};
        if (customer_id) whereCondition.customer_id = customer_id;

        if (isPaginatedRequest) {
            // Пагинированный и фильтрованный запрос
            const parsedPage = parseInt(page) || 1;
            const parsedLimit = parseInt(limit) || 10;
            const offset = (parsedPage - 1) * parsedLimit;

            if (search) {
                whereCondition[Op.or] = [
                    { imei: { [Op.like]: `%${search}%` } },
                    { model: { [Op.like]: `%${search}%` } },
                ];
            }
            if (manufacturer) whereCondition.manufacturer = manufacturer;

            const { count, rows } = await Device.findAndCountAll({
                where: whereCondition,
                include: [
                    { model: Store, attributes: ['name'] },
                    { model: Customer, attributes: ['name', 'phone'] },
                ],
                limit: parsedLimit,
                offset,
                order: [['id', 'DESC']],
            });

            res.json({
                devices: rows,
                totalPages: Math.ceil(count / parsedLimit),
                currentPage: parsedPage,
            });
        } else {
            // Простой запрос без пагинации
            const devices = await Device.findAll({
                where: whereCondition,
                include: [{ model: Store, attributes: ['name'] }],
            });
            res.json(devices);
        }
    } catch (error) {
        console.error('Ошибка при получении устройств:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id, {
            include: [
                { model: Store, attributes: ["id", "name", "location"] },
                { model: Customer, attributes: ["id", "name", "phone"] },
            ],
        });

        if (!device) return res.status(404).json({ message: "Устройство не найдено" });

        res.json(device);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post("/", async (req, res) => {
    try {
        const { imei, model, manufacturer, purchase_date, store_id, customer_id } = req.body;

        if (!imei || !model || !manufacturer || !purchase_date) {
            return res.status(400).json({ message: "IMEI, модель, производитель и дата покупки обязательны" });
        }

        const newDevice = await Device.create({ imei, model, manufacturer, purchase_date, store_id, customer_id });
        res.status(201).json(newDevice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (!device) return res.status(404).json({ message: "Устройство не найдено" });

        await device.update(req.body);
        res.json(device);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (!device) return res.status(404).json({ message: "Устройство не найдено" });

        await device.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
