# Warranty Service Web Tool — Веб-инструмент для гарантийного обслуживания

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)  
![Node.js](https://img.shields.io/badge/Node.js-18.15-green?logo=node.js)  
![SQL Server](https://img.shields.io/badge/SQL%20Server-2019-red?logo=microsoft-sql-server)  
![License](https://img.shields.io/badge/Лицензия-MIT-yellow)

---

## Описание проекта

**Warranty Service Web Tool** — дипломный проект, разработанный для **ООО «Мостелеко»** в рамках обучения в **Подмосковном политехническом колледже** (2025 г.).

Приложение автоматизирует процессы **гарантийного обслуживания** клиентского оборудования (мобильные телефоны, планшеты и др.):

- Регистрация и управление клиентами  
- Учёт устройств по IMEI  
- Отслеживание гарантийных случаев  
- Управление запасами запчастей  
- Ведение справочников: магазины, сотрудники, поставщики  
- Аналитический дашборд  
- Экспорт данных в CSV/PDF  
- Безопасность: JWT, ролевая модель, шифрование паролей  

> Цель — повысить эффективность сервисного центра, снизить ошибки и улучшить клиентский опыт.

---

## Технологический стек

| Категория       | Технология                          |
|----------------|-------------------------------------|
| **Frontend**    | React.js (SPA), Tailwind CSS, Chart.js |
| **Backend**     | Node.js, Express.js, Sequelize ORM  |
| **База данных** | Microsoft SQL Server                |
| **Аутентификация** | JWT, bcrypt                      |
| **API**         | RESTful                             |
| **Дополнительно** | Axios, jsPDF, Feather Icons       |

---

## Установка и запуск

### Требования
- Node.js ≥ 18
- SQL Server 2019+
- Git

### Шаги

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-username/warranty-service-tool.git
cd warranty-service-tool

# 2. Установить зависимости (frontend и backend)
cd frontend && npm install
cd ../backend && npm install

# 3. Настроить .env файлы
# backend/.env
DB_HOST=localhost
DB_NAME=MostelekoDB
DB_USER=sa
DB_PASS=your_password
JWT_SECRET=your_jwt_secret

# 4. Запустить БД (SQL Server)
# Создать базу MostelekoDB и выполнить миграции

# 5. Запустить backend
cd backend
npm run dev

# 6. Запустить frontend
cd ../frontend
npm start
