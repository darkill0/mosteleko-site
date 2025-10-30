const express = require("express");
const RepairStatus = require("../models/RepairStatus");
const WarrantyCase = require("../models/WarrantyCase");

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const statuses = await RepairStatus.findAll({
            include: { model: WarrantyCase, attributes: ["id", "issue_description"] },
        });
        res.json(statuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const status = await RepairStatus.findByPk(req.params.id, {
            include: { model: WarrantyCase, attributes: ["id", "issue_description"] },
        });

        if (!status) return res.status(404).json({ message: "Статус ремонта не найден" });

        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post("/", async (req, res) => {
    try {
        const { warranty_case_id, status, comment } = req.body;

        if (!warranty_case_id || !status) {
            return res.status(400).json({ message: "Гарантийный случай и статус обязательны" });
        }

        const newStatus = await RepairStatus.create({ warranty_case_id, status, comment });
        res.status(201).json(newStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const status = await RepairStatus.findByPk(req.params.id);
        if (!status) return res.status(404).json({ message: "Статус ремонта не найден" });

        await status.update(req.body);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const status = await RepairStatus.findByPk(req.params.id);
        if (!status) return res.status(404).json({ message: "Статус ремонта не найден" });

        await status.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
