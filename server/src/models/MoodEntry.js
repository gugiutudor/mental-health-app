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
  // Configurare pentru transformarea automată
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Adaugă un câmp 'id' care este o versiune string a _id-ului MongoDB
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;

      // Asigură formatul corect pentru date
      if (ret.date) {
        ret.date = new Date(ret.date).toISOString();
      }
      
      // Asigură că toți factorii sunt numere
      if (ret.factors) {
        Object.keys(ret.factors).forEach(key => {
          if (ret.factors[key] !== undefined && ret.factors[key] !== null) {
            ret.factors[key] = Number(ret.factors[key]);
          }
        });
      } else {
        ret.factors = {};
      }
      
      // Asigură că tags este un array
      if (!ret.tags) {
        ret.tags = [];
      }
      
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      // Adaugă un câmp 'id' care este o versiune string a _id-ului MongoDB
      ret.id = ret._id.toString();
      
      // Asigură formatul corect pentru date
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

// Adaugă un virtual pentru id care returnează _id ca string
MoodEntrySchema.virtual('id').get(function() {
  return this._id.toString();
});

// Hook pre-save pentru validare
MoodEntrySchema.pre('save', function(next) {
  // Asigură-te că date este un obiect Date valid
  if (this.date && !(this.date instanceof Date)) {
    try {
      this.date = new Date(this.date);
    } catch (e) {
      this.date = new Date();
    }
  }

  // Asigură-te că mood este un număr între 1 și 10
  if (this.mood !== undefined) {
    const moodNum = Number(this.mood);
    if (!isNaN(moodNum)) {
      this.mood = Math.min(Math.max(1, moodNum), 10);
    }
  }

  // Asigură-te că factorii sunt numere între 1 și 5
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