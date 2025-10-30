const express = require('express');
const { Op } = require('sequelize');
const SparePart = require('../models/SparePart');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        let { page = 1, limit = 10, search, manufacturer, stock } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (search) {
            whereCondition[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { manufacturer: { [Op.like]: `%${search}%` } },
            ];
        }
        if (manufacturer) whereCondition.manufacturer = manufacturer;
        if (stock) {
            if (stock === 'low') whereCondition.stock_quantity = { [Op.lte]: 5 };
            if (stock === 'out') whereCondition.stock_quantity = 0;
            if (stock === 'normal') whereCondition.stock_quantity = { [Op.gt]: 5 };
        }

        const { count, rows } = await SparePart.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [['id', 'ASC']],
        });

        res.json({
            spareParts: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Ошибка при получении запчастей:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const sparePart = await SparePart.findByPk(req.params.id);
        if (!sparePart) return res.status(404).json({ message: 'Запчасть не найдена' });

        res.json(sparePart);
    } catch (error) {
        console.error('Ошибка при получении запчасти:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, manufacturer, price, stock_quantity } = req.body;
        if (!name || !manufacturer || !price || !stock_quantity) {
            return res.status(400).json({ message: 'Все поля обязательны' });
        }

        const newSparePart = await SparePart.create({ name, manufacturer, price, stock_quantity });
        res.status(201).json(newSparePart);
    } catch (error) {
        console.error('Ошибка при создании запчасти:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const sparePart = await SparePart.findByPk(req.params.id);
        if (!sparePart) return res.status(404).json({ message: 'Запчасть не найдена' });

        await sparePart.update(req.body);
        res.json(sparePart);
    } catch (error) {
        console.error('Ошибка при обновлении запчасти:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const sparePart = await SparePart.findByPk(req.params.id);
        if (!sparePart) return res.status(404).json({ message: 'Запчасть не найдена' });

        await sparePart.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка при удалении запчасти:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;