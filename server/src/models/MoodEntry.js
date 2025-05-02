const mongoose = require('mongoose');

const MoodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    trim: true
  },
  factors: {
    sleep: {
      type: Number,
      min: 1,
      max: 5
    },
    stress: {
      type: Number,
      min: 1,
      max: 5
    },
    activity: {
      type: Number,
      min: 1,
      max: 5
    },
    social: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const MoodEntry = mongoose.model('MoodEntry', MoodEntrySchema);

module.exports = MoodEntry;