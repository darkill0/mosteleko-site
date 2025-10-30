const express = require("express");
const bcrypt = require("bcryptjs"); // Для хеширования пароля
const { Op } = require("sequelize");
const User = require("../models/User");

const router = express.Router();
const saltRounds = 10; // Количество раундов для хеширования пароля

// 🔹 Получение списка пользователей с фильтрацией и пагинацией
router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 10, role } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition = role ? { role } : {}; // Фильтр по роли

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ["password_hash"] }, // 🔒 Не возвращаем пароли
      order: [["created_at", "DESC"]],
      offset,
      limit,
    });

    res.json({
      users: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// 🔹 Получение одного пользователя по ID (без пароля)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash"] }, // 🔒 Не возвращаем пароль
    });

    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    res.json(user);
  } catch (error) {
    console.error("Ошибка при получении пользователя:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// 🔹 Создание нового пользователя (с хешированием пароля)
router.post("/", async (req, res) => {
  try {
    const { login, password, role } = req.body;

    if (!login || !password || !role) {
      return res.status(400).json({ message: "Логин, пароль и роль обязательны" });
    }

    // Проверка на существующий логин
    const existingUser = await User.findOne({ where: { login } });
    if (existingUser) {
      return res.status(400).json({ message: "Логин уже используется" });
    }

    // Хешируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({ login, password_hash: hashedPassword, role });
    res.status(201).json({ message: "Пользователь создан", userId: newUser.id });
  } catch (error) {
    console.error("Ошибка при создании пользователя:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// 🔹 Обновление пользователя (можно изменить логин, роль и пароль)
router.put("/:id", async (req, res) => {
  try {
    const { login, password, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    if (login) {
      const existingUser = await User.findOne({ where: { login, id: { [Op.ne]: user.id } } });
      if (existingUser) {
        return res.status(400).json({ message: "Логин уже используется" });
      }
      user.login = login;
    }

    if (password) {
      user.password_hash = await bcrypt.hash(password, saltRounds); // Хешируем новый пароль
    }

    if (role) {
      user.role = role;
    }

    await user.save();
    res.json({ message: "Пользователь обновлен" });
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// 🔹 Удаление пользователя
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    await user.destroy();
    res.status(204).send(); // Нет содержимого
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
