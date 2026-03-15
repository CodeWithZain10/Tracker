const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    assignedPlatforms: {
        type: [String],
        enum: ['Facebook', 'LinkedIn'],
        default: ['Facebook', 'LinkedIn']
    },
    stats: {
        facebook: {
            reach: { type: Number, default: 0 },
            followers: { type: Number, default: 0 },
            engagement: { type: Number, default: 0 }
        },
        linkedin: {
            reach: { type: Number, default: 0 },
            followers: { type: Number, default: 0 },
            engagement: { type: Number, default: 0 }
        }
    }
}, {
    timestamps: true
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
