const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['mindfulness', 'breathing', 'cognitive', 'physical', 'social', 'creative', 'other']
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  content: {
    steps: [{
      type: String,
      required: true
    }],
    audioUrl: String,
    videoUrl: String
  },
  recommendedFor: [{
    moodLevel: {
      min: Number,
      max: Number
    },
    factors: {
      type: Map,
      of: String
    }
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Exercise = mongoose.model('Exercise', ExerciseSchema);

module.exports = Exercise;