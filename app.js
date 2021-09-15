const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const cors = require('cors');
const SyncServer = require('./socket/syncServer.js');
// mongoose.set("useFindAndModify", false);
// mongoose.set("useCreateIndex", true);


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const inventoryRouter = require('./routes/inventory');
const ordersRouter = require('./routes/orders');
const reportsRouter = require('./routes/reports');
const inventoryCategoryRouter = require('./routes/inventoryCategory');
const searchRouter = require('./routes/search');

const app = express();
app.use(cors());

const http = require("http").createServer(app);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Connect to database
// const MONGODB_URI = "mongodb+srv://nudle:nudle@cluster0.aahux.mongodb.net/coreDB?retryWrites=true&w=majority";
// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// mongoose.connection.on("connected", () => {
//   console.log("Connected to database!");
// });

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// // Routes
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/inventory', inventoryRouter);
// app.use('/inventory-categories', inventoryCategoryRouter);
// app.use('/orders',ordersRouter);
// app.use('/reports',reportsRouter);
// app.use('/search', searchRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// // module.exports = app;
// http.listen(process.env.PORT || 5000, function () {
//   const host = http.address().address;
//   const port = process.env.PORT || 5000; //http.address().port;
//   console.log(`App listening on port ${port}`);
// });

// sync server
let syncServer = new SyncServer(2100);
syncServer.init()
.then(() => {
  // start....
  syncServer.start();
})

// prod url for carpe
// mongodb+srv://admin:root@carpecluster.1wbu3.mongodb.net/carpeDB?retryWrites=true&w=majority
