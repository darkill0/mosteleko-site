const express = require("express");
const Employee = require("../models/Employee");
const Store = require("../models/Store");

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const employees = await Employee.findAll({
            include: { model: Store, attributes: ["id", "name", "location"] },
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id, {
            include: { model: Store, attributes: ["id", "name", "location"] },
        });

        if (!employee) return res.status(404).json({ message: "Сотрудник не найден" });

        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post("/", async (req, res) => {
    try {
        const { name, position, phone, email, store_id } = req.body;

        if (!name || !position) {
            return res.status(400).json({ message: "Имя и должность обязательны" });
        }

        const newEmployee = await Employee.create({ name, position, phone, email, store_id });
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: "Сотрудник не найден" });

        await employee.update(req.body);
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: "Сотрудник не найден" });

        await employee.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
