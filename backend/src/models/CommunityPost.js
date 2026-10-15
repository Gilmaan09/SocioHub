const mongoose = require('mongoose')

const communityPostSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Society',
      required: true,
      index: true,
    },

    wingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wing',
      index: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    scope: {
      type: String,
      enum: ['WING', 'SOCIETY'],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },
  },
  { timestamps: true },
)

// Useful for fetching recent discussions efficiently
communityPostSchema.index({
  societyId: 1,
  scope: 1,
  wingId: 1,
  createdAt: -1,
})

module.exports = mongoose.model(
  'CommunityPost',
  communityPostSchema,
)