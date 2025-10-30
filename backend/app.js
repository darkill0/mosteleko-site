var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); // Подключаем CORS
var sequelize = require("./database")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var customersRouter = require('./routes/customers');
var devicesRouter = require('./routes/devices');
var employeesRouter = require('./routes/employees');
var repairPartsRouter = require('./routes/repairParts');
var repairStatusesRouter = require('./routes/repairStatuses');
var sparePartsRouter = require('./routes/spareParts');
var storesRouter = require('./routes/stores');
var suppliersRouter = require('./routes/suppliers');
var warrantyCasesRouter = require('./routes/warrantyCases');

var app = express();

// Разрешаем CORS для всех доменов
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение маршрутов
app.use('/', indexRouter);
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
app.use('/users', usersRouter);
app.use('/customers', customersRouter);
app.use('/devices', devicesRouter);
app.use('/employees', employeesRouter);
app.use('/repair-parts', repairPartsRouter);
app.use('/repair-statuses', repairStatusesRouter);
app.use('/spare-parts', sparePartsRouter);
app.use('/stores', storesRouter);
app.use('/suppliers', suppliersRouter);
app.use('/warranty-cases', warrantyCasesRouter);
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
