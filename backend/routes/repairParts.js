const express = require("express");
const RepairPart = require("../models/RepairPart");
const RepairStatus = require("../models/RepairStatus");
const SparePart = require("../models/SparePart");

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const repairParts = await RepairPart.findAll({
            include: [
                { model: RepairStatus, attributes: ["id", "status"] },
                { model: SparePart, attributes: ["id", "name", "manufacturer"] },
            ],
        });
        res.json(repairParts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const repairPart = await RepairPart.findByPk(req.params.id, {
            include: [
                { model: RepairStatus, attributes: ["id", "status"] },
                { model: SparePart, attributes: ["id", "name", "manufacturer"] },
            ],
        });

        if (!repairPart) return res.status(404).json({ message: "Запись не найдена" });

        res.json(repairPart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post("/", async (req, res) => {
    try {
        const { repair_status_id, spare_part_id, quantity } = req.body;

        if (!repair_status_id || !spare_part_id || !quantity) {
            return res.status(400).json({ message: "Все поля обязательны" });
        }

        const newRepairPart = await RepairPart.create({ repair_status_id, spare_part_id, quantity });
        res.status(201).json(newRepairPart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const repairPart = await RepairPart.findByPk(req.params.id);
        if (!repairPart) return res.status(404).json({ message: "Запись не найдена" });

        await repairPart.update(req.body);
        res.json(repairPart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const repairPart = await RepairPart.findByPk(req.params.id);
        if (!repairPart) return res.status(404).json({ message: "Запись не найдена" });

        await repairPart.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
