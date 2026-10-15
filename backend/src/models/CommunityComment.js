const mongoose = require('mongoose')

const communityCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
      index: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
  },
  { timestamps: true },
)

communityCommentSchema.index({
  postId: 1,
  createdAt: 1,
})

module.exports = mongoose.model(
  'CommunityComment',
  communityCommentSchema,
)