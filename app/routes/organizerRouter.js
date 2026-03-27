const express = require('express');
const organizerController = require('../controller/organizerController');
const CheckAuth = require('../middleware/CheckAuth');
const roleChecker = require('../middleware/roleValidate');

const Router = express.Router();

Router.get('/dashboard',
    CheckAuth,
    organizerController.dashboard);

Router.post('/create/event/store', CheckAuth, roleChecker('organizer'), organizerController.createEvent);
Router.get('/view/event/list', CheckAuth, organizerController.eventList);
Router.get('/view/organizer/list', CheckAuth, organizerController.organizerList);
Router.get('/view/organizer/details/:id', CheckAuth, organizerController.viewOrganizerDetails);

module.exports = Router;
