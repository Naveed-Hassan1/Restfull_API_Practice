mongoose = require("mongoose");

const schema = mongoose.Schema({
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /@/
    },
    department: {
        type: String,
        required: true,
        enum: ['CS', 'EE', 'SE','AI','BBA']
    },
    cgpa: {
        type: Number,
        min: 0.0,
        max: 4.0
    },
    enrollmentYear: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});
module.exports = mongoose.model('Student', schema);;