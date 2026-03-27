const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    event_name: {
        type: String,
        required: true,
        trim: true
    },
    eventDescription: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    eventDateTime: {
        type: String,
        required: true
    },
    weekday: {
        type: String
    },
    time: {
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
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

const eventModel = mongoose.model("event", eventSchema);

module.exports = eventModel;
