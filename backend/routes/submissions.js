const express = require('express');
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');
const router = express.Router();

// Helper: Admin check
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

// @route   GET /api/submissions
// @desc    Get all submissions (paginated, filterable, sortable) - ADMIN ONLY
// @access  Private (Admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // max 100
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-submittedAt'; // default: newest first

    // Build filter
    const filter = {};
    if (req.query.userType) filter['profile.userType'] = req.query.userType;
    if (req.query.county) filter['profile.county'] = req.query.county;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { 'profile.county': searchRegex },
        { 'problems.cropLossFrequency': searchRegex },
        { 'farmerFeatures.expertTopics': searchRegex },
      ];
    }

    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v') // exclude version key
      .lean();

    res.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get single submission by ID - ADMIN ONLY
// @access  Private (Admin)
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).select('-__v');
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    res.json(submission);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Invalid submission ID' });
    }
    console.error('Error fetching submission:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/submissions
// @desc    Create new submission (public or authenticated)
// @access  Public (or add auth if needed)
router.post('/', async (req, res) => {
  try {
    // Basic validation
    const { profile, problems } = req.body;
    if (!profile || !problems) {
      return res.status(400).json({ msg: 'Profile and problems are required' });
    }

    const submission = new Submission({
      ...req.body,
      submittedAt: new Date(), // ensure fresh timestamp
    });

    await submission.save();
    res.status(201).json({ msg: 'Submission saved successfully', id: submission._id });
  } catch (err) {
    console.error('Error saving submission:', err);
    res.status(400).json({ msg: err.message || 'Invalid submission data' });
  }
});

// @route   PUT /api/submissions/:id
// @desc    Update submission - ADMIN ONLY
// @access  Private (Admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    res.json({ msg: 'Submission updated', submission });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Invalid submission ID' });
    }
    console.error('Error updating submission:', err);
    res.status(400).json({ msg: err.message || 'Update failed' });
  }
});

// @route   DELETE /api/submissions/:id
// @desc    Delete submission - ADMIN ONLY
// @access  Private (Admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    res.json({ msg: 'Submission deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Invalid submission ID' });
    }
    console.error('Error deleting submission:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;