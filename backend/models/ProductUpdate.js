const mongoose = require('mongoose');

const updateSchema = mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    product: {
        type: String,
        required: true,
        enum: ['RentKar', 'UniConnect', 'Other'],
        default: 'Other'
    },
    content: {
        type: String,
        required: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isResolved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Update = mongoose.model('ProductUpdate', updateSchema);

module.exports = Update;
