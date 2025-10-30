const express = require('express');
const { Op } = require('sequelize');
const Store = require('../models/Store');
const Employee = require('../models/Employee');

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
                { location: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Store.findAndCountAll({
            where: whereCondition,
            include: [{ model: Employee, as: 'manager', attributes: ['id', 'name'] }],
            limit,
            offset,
            order: [['id', 'ASC']],
        });

        res.json({
            stores: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Ошибка при получении магазинов:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id, {
            include: [{ model: Employee, as: 'manager', attributes: ['id', 'name'] }],
        });
        if (!store) return res.status(404).json({ message: 'Магазин не найден' });

        res.json(store);
    } catch (error) {
        console.error('Ошибка при получении магазина:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, location, phone, manager_id } = req.body;
        if (!name || !location || !phone) {
            return res.status(400).json({ message: 'Все поля обязательны' });
        }

        const newStore = await Store.create({ name, location, phone, manager_id });
        res.status(201).json(newStore);
    } catch (error) {
        console.error('Ошибка при создании магазина:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id);
        if (!store) return res.status(404).json({ message: 'Магазин не найден' });

        await store.update(req.body);
        res.json(store);
    } catch (error) {
        console.error('Ошибка при обновлении магазина:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id);
        if (!store) return res.status(404).json({ message: 'Магазин не найден' });

        await store.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка при удалении магазина:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;