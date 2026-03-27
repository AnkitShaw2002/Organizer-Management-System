const express = require('express');
const adminController = require('../controller/authController');
const CheckAuth = require('../middleware/CheckAuth');
const authorize = require("../middleware/roleValidate");
const Router = express.Router();

// Router.get('/register/view',AuthEjsController.registerView);
Router.get('/register', adminController.registerView);
Router.post('/register/store', adminController.registerCreate);

Router.get('/login', adminController.LoginView);
Router.post('/login/store', adminController.LoginCreate);
Router.get('/logout', adminController.logout);


module.exports = Router;