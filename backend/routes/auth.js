const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = await User.findOne({ where: { login } });
        if (!user) {
            return res.status(401).json({ message: "Неверный логин или пароль" });
        }


        if (!password===user.password_hash) {
            return res.status(401).json({ message: "Неверный логин или пароль" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, "your-secret-key", { expiresIn: "1h" });
        res.json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;