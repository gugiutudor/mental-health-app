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
    trim: true,
    default: ''
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
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;

      if (ret.date) {
        ret.date = new Date(ret.date).toISOString();
      }
      
      if (ret.factors) {
        Object.keys(ret.factors).forEach(key => {
          if (ret.factors[key] !== undefined && ret.factors[key] !== null) {
            ret.factors[key] = Number(ret.factors[key]);
          }
        });
      } else {
        ret.factors = {};
      }
      
      if (!ret.tags) {
        ret.tags = [];
      }
      
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      
      if (ret.date) {
        try {
          ret.date = new Date(ret.date).toISOString();
        } catch (e) {
          ret.date = new Date().toISOString();
        }
      } else {
        ret.date = new Date().toISOString();
      }
      
      return ret;
    }
  }
});

MoodEntrySchema.virtual('id').get(function() {
  return this._id.toString();
});

MoodEntrySchema.pre('save', function(next) {

  if (this.date && !(this.date instanceof Date)) {
    try {
      this.date = new Date(this.date);
    } catch (e) {
      this.date = new Date();
    }
  }


  if (this.mood !== undefined) {
    const moodNum = Number(this.mood);
    if (!isNaN(moodNum)) {
      this.mood = Math.min(Math.max(1, moodNum), 10);
    }
  }


  if (this.factors) {
    ['sleep', 'stress', 'activity', 'social'].forEach(factor => {
      if (this.factors[factor] !== undefined && this.factors[factor] !== null) {
        const factorNum = Number(this.factors[factor]);
        if (!isNaN(factorNum)) {
          this.factors[factor] = Math.min(Math.max(1, factorNum), 5);
        }
      }
    });
  }

  next();
});

const MoodEntry = mongoose.model('MoodEntry', MoodEntrySchema);

module.exports = MoodEntry;