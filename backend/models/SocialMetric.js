const mongoose = require('mongoose');

const socialMetricSchema = mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    platform: {
        type: String,
        required: true,
        enum: ['LinkedIn', 'Instagram', 'Facebook']
    },
    weekStarting: {
        type: Date,
        required: true
    },
    stats: {
        // LinkedIn: impressions, followers, post count
        // Instagram: reach, reels views, followers
        // Facebook: page likes, post reach
        impressions: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        postCount: { type: Number, default: 0 },
        reach: { type: Number, default: 0 },
        reelsViews: { type: Number, default: 0 },
        pageLikes: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

const SocialMetric = mongoose.model('SocialMetric', socialMetricSchema);

module.exports = SocialMetric;
