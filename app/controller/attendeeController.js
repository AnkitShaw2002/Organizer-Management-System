const userModel = require('../model/userModel');
const eventModel = require('../model/eventModel');
const bookingModel = require('../model/bookingModel');

class userController {

    async dashboard(req, res) {
        try {
            res.render('dashboard', { data: req.user });
        } catch (error) {
            res.redirect('/auth/login');
        }
    }


    async getOrganizers(req, res) {
        try {
            const organizers = await userModel.find({ role: 'organizer' }).select('-password').lean();
            return res.status(200).json({
                status: true,
                data: organizers
            });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


    async getEventsByOrganizer(req, res) {
        try {
            const { organizerId } = req.params;
            const events = await eventModel.find({ organizer: organizerId, active: true }).lean();
            return res.status(200).json({
                status: true,
                data: events
            });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


    async bookEvent(req, res) {
        try {
            const { eventId } = req.body;

            if (!eventId) {
                return res.status(400).json({ status: false, message: 'Event is required' });
            }

            const event = await eventModel.findById(eventId).lean();
            if (!event) {
                return res.status(404).json({ status: false, message: 'Event not found' });
            }

            // Check if attendee already booked this event
            const alreadyBooked = await bookingModel.findOne({
                attendee: req.user.id,
                event: eventId
            });
            if (alreadyBooked) {
                return res.status(409).json({ status: false, message: 'You have already booked this event' });
            }

            const booking = new bookingModel({
                attendee: req.user.id,
                attendeeName: req.user.name,
                event: eventId,
                eventName: event.event_name,
                organizer: event.organizer,
                organizerName: event.organizerName,
                weekday: event.weekday,
                time: event.time,
                eventDateTime: event.eventDateTime
            });
            await booking.save();

            return res.status(201).json({
                status: true,
                message: 'Event booked successfully'
            });

        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


    async myBookings(req, res) {
        try {
            const bookings = await bookingModel.find({ attendee: req.user.id }).lean();
            return res.status(200).json({
                status: true,
                data: bookings
            });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

}

module.exports = new userController();
