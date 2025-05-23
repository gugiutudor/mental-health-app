// În fișierul server/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: '20:00'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Adăugăm un câmp virtual pentru a menține compatibilitatea cu codul vechi
UserSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Asigurăm că virtualele sunt incluse în răspunsul JSON
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.name = `${ret.firstName} ${ret.lastName}`;
    return ret;
  }
});

// Metodă pentru hash-uirea parolei înainte de salvare
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Metodă pentru verificarea parolei
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;