const eventModel = require('../model/eventModel');
const userModel = require('../model/userModel');


class organizerController {

    async dashboard(req, res) {
        try {
            res.render('dashboard', { data: req.user });
        } catch (error) {
            res.redirect('/auth/login');
        }
    }


    async createEvent(req, res) {
    try {
        const { event_name, eventDescription, duration, eventDateTime } = req.body;

        if (!event_name || !eventDescription || !duration || !eventDateTime) {
            return res.status(400).json({
                status: false,
                message: 'All fields are required'
            });
        }

        // Parse and validate duration
        const durationHours = parseFloat(duration);
        if (isNaN(durationHours) || durationHours <= 0) {
            return res.status(400).json({
                status: false,
                message: 'Duration must be a positive number (in hours)'
            });
        }

        // Parse start datetime
        const startDateTime = new Date(eventDateTime);
        if (isNaN(startDateTime.getTime())) {
            return res.status(400).json({
                status: false,
                message: 'Invalid eventDateTime format.")'
            });
        }

        // Calculate end datetime
        const endDateTime = new Date(startDateTime.getTime() + (durationHours * 60 * 60 * 1000));

        // Get weekday and time
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekday = weekdays[startDateTime.getDay()];
        const time = startDateTime.toTimeString().slice(0, 5); // 

        
        const sameDay = startDateTime.toISOString().split('T')[0];
        
        const candidates = await eventModel.find({
            active: true,
            eventDateTime: new RegExp(`^${sameDay}`)
        }).lean();

        
        const conflicts = candidates.filter(event => {
            try {
                
                const eventStart = new Date(event.eventDateTime);
                if (isNaN(eventStart.getTime())) return false;

               
                const eventDurationHours = parseFloat(event.duration);
                if (isNaN(eventDurationHours) || eventDurationHours <= 0) return false;

                
                const eventEnd = new Date(eventStart.getTime() + (eventDurationHours * 60 * 60 * 1000));

                
                return startDateTime < eventEnd && endDateTime > eventStart;
            } catch (e) {
                return false; 
            }
        });

        if (conflicts.length > 0) {
            const conflictDetails = conflicts.map(event => {
                const eventStart = new Date(event.eventDateTime);
                const eventDuration = parseFloat(event.duration);
                const eventEndTime = new Date(eventStart.getTime() + (eventDuration * 60 * 60 * 1000));
                
                return `"${event.event_name}" (${event.organizerName}) ${eventStart.toTimeString().slice(0,5)}-${eventEndTime.toTimeString().slice(0,5)}`;
            }).join(', ');
            
            return res.status(409).json({
                status: false,
                message: `Time slot overlaps with existing events: ${conflictDetails}`
            });
        }

        // Create and save event
        const event = new eventModel({
            event_name,
            eventDescription,
            duration: durationHours.toString(), // Store as string to match existing data
            eventDateTime: eventDateTime, // Keep ISO string format
            weekday,
            time,
            organizer: req.user.id,
            organizerName: req.user.name
        });
        
        await event.save();

        return res.status(201).json({
            status: true,
            message: 'Event created successfully',
            event: {
                id: event._id,
                event_name,
                startTime: time,
                duration: `${durationHours}hr`,
                weekday,
                endTime: endDateTime.toTimeString().slice(0, 5)
            }
        });

    } catch (error) {
        console.error('Create event error:', error);
        return res.status(500).json({ 
            status: false, 
            message: error.message 
        });
    }
}


    async eventList(req, res) {
        try {
            const events = await eventModel.find({ active: true }).lean();

            return res.status(200).json({
                status: true,
                data: events
            });

        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


    async organizerList(req, res) {
        try {
            const organizers = await userModel.find({ role: 'organizer' }).select('-password').lean();

            // Attach events to each organizer
            const organizersWithEvents = await Promise.all(organizers.map(async (org) => {
                const events = await eventModel.find({ organizer: org._id, active: true }).lean();
                return { ...org, events, totalEvents: events.length };
            }));

            return res.status(200).json({
                status: true,
                data: organizersWithEvents
            });

        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


    async viewOrganizerDetails(req, res) {
        try {
            const { id } = req.params;
            const organizer = await userModel.findById(id).select('-password').lean();
            if (!organizer) {
                return res.status(404).json({ status: false, message: 'Organizer not found' });
            }
            const events = await eventModel.find({ organizer: id, active: true }).lean();

            return res.status(200).json({
                status: true,
                data: { ...organizer, events }
            });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }
}

module.exports = new organizerController();
