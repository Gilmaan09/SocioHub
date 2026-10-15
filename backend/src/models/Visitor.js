const mongoose = require('mongoose')

const visitorSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
      index: true,
    },

    watchmanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    visitorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: true,
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    vehicleNumber: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    visitorCount: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    status: {
      type: String,
      enum: [
        'WAITING',
        'APPROVED',
        'REJECTED',
        'INSIDE',
        'EXITED',
      ],
      default: 'WAITING',
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    approvedAt: {
      type: Date,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    rejectedAt: {
      type: Date,
    },

    entryTime: {
      type: Date,
      default: Date.now,
    },

    exitTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model(
  'Visitor',
  visitorSchema
)