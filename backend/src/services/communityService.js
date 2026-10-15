const CommunityPost = require('../models/CommunityPost')
const CommunityComment = require('../models/CommunityComment')
const Flat = require('../models/Flat')
const Wing = require('../models/Wing')
const { notifyCommunityComment, notifyCommunityPost } = require('./notificationService')

const populatePost = (query) =>
  query
    .populate('authorId', 'name role')
    .populate('wingId', 'name')

const populateComment = (query) =>
  query.populate('authorId', 'name role')

async function getUserWing(user) {
  if (!user.flatId || !user.societyId) return null

  const flat = await Flat.findOne({
    _id: user.flatId,
    societyId: user.societyId,
  }).select('wingId')

  if (!flat || !flat.wingId) return null

  return Wing.findOne({
    _id: flat.wingId,
    societyId: user.societyId,
  })
}

// Create a community post
async function createPost(user, data) {
  if (!user.societyId) {
    return { error: 'Your account is not assigned to a society' }
  }

  const scope = data.scope

  if (!['WING', 'SOCIETY'].includes(scope)) {
    return { error: 'Invalid community scope' }
  }

  let wingId = null

  // Wing discussion
  if (scope === 'WING') {
    const wing = await getUserWing(user)

    if (!wing) {
      return {
        error: 'Your account is not assigned to a society wing',
      }
    }

    wingId = wing._id
  }

  // Society discussion
  const post = await CommunityPost.create({
    societyId: user.societyId,
    wingId,
    authorId: user._id,
    scope,
    title: data.title,
    content: data.content,
  })

  await notifyCommunityPost(post)

  return {
    post: await populatePost(
      CommunityPost.findById(post._id)
    ),
  }
}


// Get posts for the user's wing
async function listWingPosts(user) {
  if (!user.societyId) {
    return { error: 'Your account is not assigned to a society' }
  }

  const wing = await getUserWing(user)

  if (!wing) {
    return {
      error: 'Your account is not assigned to a society wing',
    }
  }

  return populatePost(
    CommunityPost.find({
      societyId: user.societyId,
      scope: 'WING',
      wingId: wing._id,
    }).sort({ createdAt: -1 })
  )
}


// Get posts for the entire society
async function listSocietyPosts(user) {
  if (!user.societyId) {
    return { error: 'Your account is not assigned to a society' }
  }

  return populatePost(
    CommunityPost.find({
      societyId: user.societyId,
      scope: 'SOCIETY',
    }).sort({ createdAt: -1 })
  )
}


// Find one post that the user is allowed to access
async function findPost(user, id) {
  if (!user.societyId) return null

  const post = await CommunityPost.findOne({
    _id: id,
    societyId: user.societyId,
  })

  if (!post) return null

  // Society post → everyone in same society can access
  if (post.scope === 'SOCIETY') {
    return populatePost(
      CommunityPost.findById(post._id)
    )
  }

  // Wing post → user must belong to same wing
  const wing = await getUserWing(user)

  if (!wing || String(post.wingId) !== String(wing._id)) {
    return null
  }

  return populatePost(
    CommunityPost.findById(post._id)
  )
}


// Add a comment to a post
async function addComment(user, postId, data) {
  const post = await CommunityPost.findOne({
    _id: postId,
    societyId: user.societyId,
  })

  if (!post) return { error: 'Community post not found' }

  // Check access to the post
  if (post.scope === 'WING') {
    const wing = await getUserWing(user)

    if (
      !wing ||
      String(post.wingId) !== String(wing._id)
    ) {
      return {
        error: 'You do not have access to this discussion',
      }
    }
  }

  const comment = await CommunityComment.create({
    postId: post._id,
    authorId: user._id,
    content: data.content,
  })

  await notifyCommunityComment(post, comment)

  return {
    comment: await populateComment(
      CommunityComment.findById(comment._id)
    ),
  }
}


// Get comments for a post
async function listComments(user, postId) {
  const post = await CommunityPost.findOne({
    _id: postId,
    societyId: user.societyId,
  })

  if (!post) return null

  // Check wing access
  if (post.scope === 'WING') {
    const wing = await getUserWing(user)

    if (
      !wing ||
      String(post.wingId) !== String(wing._id)
    ) {
      return null
    }
  }

  return populateComment(
    CommunityComment.find({
      postId: post._id,
    }).sort({ createdAt: 1 })
  )
}


// Delete user's own post
async function deletePost(user, id) {
  return CommunityPost.findOneAndDelete({
    _id: id,
    societyId: user.societyId,
    authorId: user._id,
  })
}


// Delete user's own comment
async function deleteComment(user, id) {
  return CommunityComment.findOneAndDelete({
    _id: id,
    authorId: user._id,
  })
}


module.exports = {
  createPost,
  listWingPosts,
  listSocietyPosts,
  findPost,
  addComment,
  listComments,
  deletePost,
  deleteComment,
}