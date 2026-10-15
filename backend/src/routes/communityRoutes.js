const express = require('express')

const {
  createPost,
  listWingPosts,
  listSocietyPosts,
  getPost,
  addComment,
  listComments,
  deletePost,
  deleteComment,
} = require('../controllers/communityController')

const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()
const communityMember = [authMiddleware, authorizeRoles('ADMIN', 'OWNER', 'TENANT')]

// Community discussions
router.get('/wing', ...communityMember, listWingPosts)
router.get('/society', ...communityMember, listSocietyPosts)

// Create a discussion
router.post('/', ...communityMember, createPost)

// Single discussion
router.get('/posts/:id', ...communityMember, getPost)

// Comments
router.get('/posts/:id/comments', ...communityMember, listComments)
router.post('/posts/:id/comments', ...communityMember, addComment)

// Delete own post
router.delete('/posts/:id', ...communityMember, deletePost)

// Delete own comment
router.delete('/comments/:id', ...communityMember, deleteComment)

module.exports = router
