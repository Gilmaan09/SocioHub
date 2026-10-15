const mongoose = require('mongoose')

const watchmanAttendanceSchema =
  new mongoose.Schema(
    {
      watchmanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },

      societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true,
        index: true,
      },

      dutyStart: {
        type: Date,
        required: true,
        default: Date.now,
      },

      dutyEnd: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          'ON_DUTY',
          'COMPLETED',
        ],
        default: 'ON_DUTY',
        required: true,
      },
    },
    {
      timestamps: true,
    }
  )

module.exports =
  mongoose.model(
    'WatchmanAttendance',
    watchmanAttendanceSchema
  )