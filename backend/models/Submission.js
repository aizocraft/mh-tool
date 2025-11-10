const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  profile: {
    county: String,
    userType: String,
    age: String,
    gender: String,
    deviceAccess: String
  },
  problems: {
    cropLossFrequency: String,
    adviceSources: [String],
    expertContactCount: String,
    lostMoney: String
  },
  farmerFeatures: {
    useCropGuides: String,
    aiAssistantUsefulness: Number,
    payForExpertChat: String,
    expertTopics: [String],
    joinForum: String,
    internetReliability: String
  },
  expertFeatures: {
    offerPaidConsultations: String,
    preferredFormat: String,
    weeklyConsultationCapacity: String
  },
  adminFeatures: {
    useDashboard: String,
    switchReasons: String
  },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);