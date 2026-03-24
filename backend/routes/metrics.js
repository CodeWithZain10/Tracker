const express = require('express');
const router = express.Router();
const SocialMetric = require('../models/SocialMetric');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get metrics for dashboard (with WoW)
// @route   GET /metrics/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const now = new Date();
        const startOfThisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfLastWeek = new Date(new Date(startOfThisWeek).setDate(startOfThisWeek.getDate() - 7));

        const thisWeekMetrics = await SocialMetric.find({
            weekStarting: { $gte: startOfThisWeek }
        });

        const lastWeekMetrics = await SocialMetric.find({
            weekStarting: { $gte: startOfLastWeek, $lt: startOfThisWeek }
        });

        // Aggregate stats by platform
        const platforms = ['LinkedIn', 'Instagram', 'Facebook'];
        const stats = platforms.map(platform => {
            const thisWeek = thisWeekMetrics.filter(m => m.platform === platform);
            const lastWeek = lastWeekMetrics.filter(m => m.platform === platform);

            const calculateSum = (metrics, field) => metrics.reduce((acc, curr) => acc + (curr.stats[field] || 0), 0);

            const thisWeekSum = {
                impressions: calculateSum(thisWeek, 'impressions'),
                followers: calculateSum(thisWeek, 'followers'),
                postCount: calculateSum(thisWeek, 'postCount'),
                reach: calculateSum(thisWeek, 'reach'),
                reelsViews: calculateSum(thisWeek, 'reelsViews'),
                pageLikes: calculateSum(thisWeek, 'pageLikes')
            };

            const lastWeekSum = {
                impressions: calculateSum(lastWeek, 'impressions'),
                followers: calculateSum(lastWeek, 'followers'),
                postCount: calculateSum(lastWeek, 'postCount'),
                reach: calculateSum(lastWeek, 'reach'),
                reelsViews: calculateSum(lastWeek, 'reelsViews'),
                pageLikes: calculateSum(lastWeek, 'pageLikes')
            };

            return {
                platform,
                current: thisWeekSum,
                previous: lastWeekSum
            };
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Log metrics
// @route   POST /metrics
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { platform, weekStarting, stats } = req.body;
        
        // Check if already logged for this week and platform by this user
        let metric = await SocialMetric.findOne({
            member: req.user._id,
            platform,
            weekStarting: new Date(weekStarting)
        });

        if (metric) {
            metric.stats = stats;
            const updatedMetric = await metric.save();
            res.json(updatedMetric);
        } else {
            const newMetric = await SocialMetric.create({
                member: req.user._id,
                platform,
                weekStarting: new Date(weekStarting),
                stats
            });
            res.status(201).json(newMetric);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
