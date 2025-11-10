// routes/questions.js
const express = require('express');
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const router = express.Router();

// Helper function  
function matchesConditional(profile, conditional) {
  if (!conditional) return true;
  const [path, expected] = conditional.split(':');
  const value = path.split('.').reduce((obj, key) => obj?.[key], profile);
  return String(value) === expected;
}

// GET /api/questions  
router.get('/', async (req, res) => {
  try {
    const { userType } = req.query;
    const allQuestions = await Question.find().sort({ section: 1 });

    if (!userType) {
      return res.json(allQuestions);
    }

    const profile = { userType };
    const filteredQuestions = allQuestions.filter(q => {
      if (q.section === 'profile' || q.section === 'problems') {
        return true;
      }
      return matchesConditional(profile, q.conditional);
    });

    res.json(filteredQuestions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/questions  
router.post('/', auth, async (req, res) => {
  try {
    // Check admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    // Validate required fields
    const { section, type, label } = req.body;
    if (!section || !type || !label) {
      return res.status(400).json({ 
        msg: 'Missing required fields: section, type, and label are required' 
      });
    }

    // Create and save question
    const question = new Question(req.body);
    const savedQuestion = await question.save();
    
    res.status(201).json(savedQuestion);
    
  } catch (err) {
    console.error('Error creating question:', err);
    
    // Handle different types of errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Validation error', 
        errors: err.errors 
      });
    }
    
    res.status(500).json({ 
      msg: 'Error creating question', 
      error: err.message 
    });
  }
});

// PUT /api/questions/:id  
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }

    res.json(question);
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(400).json({ 
      msg: 'Error updating question', 
      error: err.message 
    });
  }
});

// DELETE /api/questions/:id  
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({ msg: 'Question not found' });
    }

    res.json({ msg: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ 
      msg: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router;