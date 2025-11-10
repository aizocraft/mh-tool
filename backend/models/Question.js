// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  // Remove the explicit _id definition or add a default
  section: { 
    type: String, 
    required: true 
  },
  type: {
    type: String,
    enum: ['dropdown', 'radio', 'checkbox', 'scale', 'text', 'textarea'],
    required: true,
  },
  label: { 
    type: String, 
    required: true 
  },
  options: [String],
  required: { 
    type: Boolean, 
    default: false 
  },
  conditional: String,
});

// This will let Mongoose automatically handle _id
module.exports = mongoose.model('Question', questionSchema);