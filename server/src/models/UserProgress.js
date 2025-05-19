const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  duration: Number,
  feelingBefore: {
    type: Number,
    min: 1,
    max: 10
  },
  feelingAfter: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

const UserProgress = mongoose.model('UserProgress', UserProgressSchema);

module.exports = UserProgress;