const express = require('express');
const { Op } = require('sequelize');
const WarrantyCase = require('../models/WarrantyCase');
const Device = require('../models/Device');
const Customer = require('../models/Customer');
const Store = require('../models/Store');
const Employee = require('../models/Employee');
const RepairStatus = require('../models/RepairStatus');
const RepairPart = require('../models/RepairPart');
const SparePart = require('../models/SparePart');

const router = express.Router();

// Получить все гарантийные случаи
router.get('/', async (req, res) => {
    try {
        let { page = 1, limit = 10, status, search } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (status && status !== 'all') whereCondition.status = status;
        if (search && search.trim() !== '') {
            whereCondition[Op.or] = [
                { '$Device.imei$': { [Op.like]: `%${search}%` } },
                { '$Customer.name$': { [Op.like]: `%${search}%` } },
            ];
        }

        const { count, rows } = await WarrantyCase.findAndCountAll({
            where: whereCondition,
            include: [
                { model: Device, attributes: ['id', 'imei', 'model', 'manufacturer'] },
                { model: Customer, attributes: ['id', 'name', 'phone'] },
                { model: Store, attributes: ['id', 'name', 'location'] },
                { model: Employee, attributes: ['id', 'name', 'position'] },
            ],
            limit,
            offset,
            order: [['id', 'DESC']],
        });

        res.json({
            warrantyCases: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Ошибка при получении гарантийных случаев:', error);
        res.status(500).json({ error: error.message });
    }
});

// Создать новый гарантийный случай
router.post('/', async (req, res) => {
    try {
        const { device_id, customer_id, issue_description, status, store_id, employee_id } = req.body;
        if (!device_id || !customer_id || !issue_description) {
            return res.status(400).json({ message: 'Устройство, клиент и описание проблемы обязательны' });
        }
        const newCase = await WarrantyCase.create({
            device_id,
            customer_id,
            issue_description,
            status,
            store_id,
            employee_id,
        });
        res.status(201).json(newCase);
    } catch (error) {
        console.error('Ошибка при создании гарантийного случая:', error);
        res.status(500).json({ error: error.message });
    }
});

// Обновить гарантийный случай
router.put('/:id', async (req, res) => {
    try {
        const warrantyCase = await WarrantyCase.findByPk(req.params.id);
        if (!warrantyCase) return res.status(404).json({ message: 'Гарантийный случай не найден' });
        await warrantyCase.update(req.body);
        res.json(warrantyCase);
    } catch (error) {
        console.error('Ошибка при обновлении гарантийного случая:', error);
        res.status(500).json({ error: error.message });
    }
});

// Удалить гарантийный случай
router.delete('/:id', async (req, res) => {
    try {
        const warrantyCase = await WarrantyCase.findByPk(req.params.id);
        if (!warrantyCase) return res.status(404).json({ message: 'Гарантийный случай не найден' });
        await warrantyCase.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Ошибка при удалении гарантийного случая:', error);
        res.status(500).json({ error: error.message });
    }
});

// Получить историю ремонтов
router.get('/:id/repair-history', async (req, res) => {
    try {
        const repairHistory = await RepairStatus.findAll({
            where: { warranty_case_id: req.params.id },
            order: [['updated_at', 'DESC']],
            include: [{ model: RepairPart, include: [SparePart] }],
        });
        res.json(repairHistory);
    } catch (error) {
        console.error('Ошибка при получении истории ремонтов:', error);
        res.status(500).json({ error: error.message });
    }
});

// Добавить новый статус ремонта
router.post('/:id/repair-history', async (req, res) => {
    try {
        const { status, comment } = req.body;
        if (!status) return res.status(400).json({ message: 'Статус обязателен' });

        const formattedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const repairStatus = await RepairStatus.create({
            warranty_case_id: req.params.id,
            status,
            comment,
            updated_at: formattedDate,
        });
        res.status(201).json(repairStatus);
    } catch (error) {
        console.error('Ошибка при добавлении статуса ремонта:', error);
        res.status(500).json({ error: error.message });
    }
});

// Добавить запчасть к последнему статусу ремонта
router.post('/:id/repair-parts', async (req, res) => {
    try {
        const { spare_part_id, quantity } = req.body;
        if (!spare_part_id || !quantity) {
            return res.status(400).json({ message: 'Запчасть и количество обязательны' });
        }

        // Находим последний статус ремонта для данного гарантийного случая
        const latestRepairStatus = await RepairStatus.findOne({
            where: { warranty_case_id: req.params.id },
            order: [['updated_at', 'DESC']],
        });

        if (!latestRepairStatus) {
            return res.status(404).json({ message: 'Статус ремонта не найден' });
        }

        const repairPart = await RepairPart.create({
            repair_status_id: latestRepairStatus.id,
            spare_part_id,
            quantity,
        });

        res.status(201).json(repairPart);
    } catch (error) {
        console.error('Ошибка при добавлении запчасти:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;