const moment = require('moment');
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date, 
        required: true,
        validate: {
            validator: function (value){
                const isValidDate = moment(value, "DD-MM-YYYY", true).isValid();

                if(!isValidDate){
                    return false;
                }

                const dueDate = moment(value, "DD-MM-YYYY");
                if (dueDate.isBefore(moment(), 'day')) {  // Check if the date is in the past
                    return false;  // Invalid if dueDate is in the past
                }
    
                return true;
            },
            message: 'Due date must be in the future and in DD-MM-YYYY format.'
        }
    },
    priority: {
        type: String,
        enum: [ 'High', 'Medium', 'Low' ],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: [ 'Completed', 'Started', 'Not Completed' ],
        default: 'Not Completed'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;