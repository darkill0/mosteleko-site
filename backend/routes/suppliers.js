const express = require('express');
const { Op } = require('sequelize');
const Supplier = require('../models/Supplier');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        let { page = 1, limit = 10, search } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (search) {
            whereCondition[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { contact_person: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Supplier.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [['id', 'ASC']],
        });

        res.json({
            suppliers: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Ошибка при получении поставщиков:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Поставщик не найден' });

        res.json(supplier);
    } catch (error) {
        console.error('Ошибка при получении поставщика:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, contact_person, phone, email, address } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Имя поставщика обязательно' });
        }

        const newSupplier = await Supplier.create({ name, contact_person, phone, email, address });
        res.status(201).json(newSupplier);
    } catch (error) {
        console.error('Ошибка при создании поставщика:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Поставщик не найден' });

        await supplier.update(req.body);
        res.json(supplier);
    } catch (error) {
        console.error('Ошибка при обновлении поставщика:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Поставщик не найден' });

        await supplier.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка при удалении поставщика:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;