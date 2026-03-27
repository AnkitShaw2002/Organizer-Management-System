const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    attendee: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    attendeeName: {
        type: String
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'event',
        required: true
    },
    eventName: {
        type: String
    },
    organizer: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    organizerName: {
        type: String
    },
    weekday: {
        type: String
    },
    time: {
        type: String
    },
    eventDateTime: {
        type: String
    }
}, {
    timestamps: true,
});

const bookingModel = mongoose.model("booking", bookingSchema);

module.exports = bookingModel;
