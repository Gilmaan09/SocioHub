const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    dutyLocation: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ['ADMIN', 'OWNER', 'TENANT', 'WATCHMAN'],
      default: 'OWNER',
      required: true,
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
    },

    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('User', userSchema)