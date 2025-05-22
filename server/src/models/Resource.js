const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['article', 'video', 'audio', 'book', 'infographic', 'other']
  },
  url: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  recommendedFor: [{
    moodLevel: {
      min: {
        type: Number,
        min: 1,
        max: 10
      },
      max: {
        type: Number,
        min: 1,
        max: 10
      }
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
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
      if (ret.createdAt) {
        ret.createdAt = new Date(ret.createdAt).toISOString();
      }
      if (ret.updatedAt) {
        ret.updatedAt = new Date(ret.updatedAt).toISOString();
      }
      
      // Asigură că tags este un array
      if (!ret.tags) {
        ret.tags = [];
      }
      
      // Asigură că recommendedFor este un array
      if (!ret.recommendedFor) {
        ret.recommendedFor = [];
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
      if (ret.createdAt) {
        try {
          ret.createdAt = new Date(ret.createdAt).toISOString();
        } catch (e) {
          ret.createdAt = new Date().toISOString();
        }
      } else {
        ret.createdAt = new Date().toISOString();
      }
      
      if (ret.updatedAt) {
        try {
          ret.updatedAt = new Date(ret.updatedAt).toISOString();
        } catch (e) {
          ret.updatedAt = new Date().toISOString();
        }
      } else {
        ret.updatedAt = new Date().toISOString();
      }
      
      return ret;
    }
  }
});

// Adaugă un virtual pentru id care returnează _id ca string
ResourceSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Hook pre-save pentru validare
ResourceSchema.pre('save', function(next) {
  // Validează URL-ul
  if (this.url && !this.url.startsWith('http')) {
    this.url = 'https://' + this.url;
  }

  // Curăță tag-urile
  if (this.tags && Array.isArray(this.tags)) {
    this.tags = this.tags.filter(tag => tag && tag.trim().length > 0);
  }

  next();
});

const Resource = mongoose.model('Resource', ResourceSchema);

module.exports = Resource;