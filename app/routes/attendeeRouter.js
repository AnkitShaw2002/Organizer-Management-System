const express = require('express');
const attendeeController = require('../controller/attendeeController');
const CheckAuth = require('../middleware/CheckAuth');
const roleChecker = require('../middleware/roleValidate');

const Router = express.Router();

Router.get('/dashboard',
    CheckAuth,
    attendeeController.dashboard);

Router.get('/organizers', CheckAuth, attendeeController.getOrganizers);
Router.get('/events/:organizerId', CheckAuth, attendeeController.getEventsByOrganizer);
Router.post('/book/event', CheckAuth, roleChecker('attendee'), attendeeController.bookEvent);
Router.get('/my/bookings', CheckAuth, attendeeController.myBookings);

module.exports = Router;
