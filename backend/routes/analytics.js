const express = require('express');
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');
const router = express.Router();

/* ---------- ONLY ADMIN ---------- */
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });

  try {
    /* 1. Totals */
    const total = await Submission.countDocuments();

    /* 2. Demographics */
    const userTypes = await Submission.aggregate([
      { $group: { _id: '$profile.userType', count: { $sum: 1 } } },
    ]);
    const counties = await Submission.aggregate([
      { $group: { _id: '$profile.county', count: { $sum: 1 } } },
    ]);
    const ages = await Submission.aggregate([
      { $group: { _id: '$profile.age', count: { $sum: 1 } } },
    ]);

    /* 3. Problems */
    const cropLossFreq = await Submission.aggregate([
      { $group: { _id: '$problems.cropLossFrequency', count: { $sum: 1 } } },
    ]);
    const adviceSources = await Submission.aggregate([
      { $unwind: '$problems.adviceSources' },
      { $group: { _id: '$problems.adviceSources', count: { $sum: 1 } } },
    ]);
    const lostMoney = await Submission.aggregate([
      { $group: { _id: '$problems.lostMoney', count: { $sum: 1 } } },
    ]);

    /* 4. Farmer-specific */
    const farmerAI = await Submission.aggregate([
      { $match: { 'profile.userType': 'Farmer' } },
      { $group: { _id: '$farmerFeatures.aiAssistantUsefulness', count: { $sum: 1 } } },
    ]);
    const payMpesa = await Submission.aggregate([
      { $match: { 'profile.userType': 'Farmer' } },
      { $group: { _id: '$farmerFeatures.payForExpertChat', count: { $sum: 1 } } },
    ]);
    const cropGuides = await Submission.aggregate([
      { $match: { 'profile.userType': 'Farmer' } },
      { $group: { _id: '$farmerFeatures.useCropGuides', count: { $sum: 1 } } },
    ]);
    const joinForum = await Submission.aggregate([
      { $match: { 'profile.userType': 'Farmer' } },
      { $group: { _id: '$farmerFeatures.joinForum', count: { $sum: 1 } } },
    ]);

    /* 5. Expert-specific */
    const expertPaid = await Submission.aggregate([
      { $match: { 'profile.userType': 'Agricultural Expert' } },
      { $group: { _id: '$expertFeatures.offerPaidConsultations', count: { $sum: 1 } } },
    ]);
    const consultationFormat = await Submission.aggregate([
      { $match: { 'profile.userType': 'Agricultural Expert' } },
      { $group: { _id: '$expertFeatures.preferredFormat', count: { $sum: 1 } } },
    ]);
    const weeklyFarmers = await Submission.aggregate([
      { $match: { 'profile.userType': 'Agricultural Expert' } },
      { $group: { _id: '$expertFeatures.weeklyConsultationCapacity', count: { $sum: 1 } } },
    ]);

    /* 6. Admin-specific */
    const adminDashboard = await Submission.aggregate([
      { $match: { 'profile.userType': 'Administrator' } },
      { $group: { _id: '$adminFeatures.useDashboard', count: { $sum: 1 } } },
    ]);
    const switchReasons = await Submission.aggregate([
      { $match: { 'profile.userType': 'Administrator' } },
      { $group: { _id: '$adminFeatures.switchReasons', count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      userTypes,
      counties,
      ages,
      cropLossFreq,
      adviceSources,
      lostMoney,
      farmerAI,
      payMpesa,
      cropGuides,
      joinForum,
      expertPaid,
      consultationFormat,
      weeklyFarmers,
      adminDashboard,
      switchReasons,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Analytics error' });
  }
});

module.exports = router;