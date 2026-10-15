const communityService = require('../services/communityService')

// Create a community post
async function createPost(req, res) {
  try {
    const result = await communityService.createPost(
      req.user,
      req.body,
    )

    if (result.error) {
      return res.status(400).json({
        message: result.error,
      })
    }

    return res.status(201).json(result)
  } catch (error) {
    console.error('Create community post error:', error)

    return res.status(500).json({
      message: 'Failed to create community post',
    })
  }
}


// Get discussions for user's wing
async function listWingPosts(req, res) {
  try {
    const result = await communityService.listWingPosts(
      req.user,
    )

    if (result?.error) {
      return res.status(400).json({
        message: result.error,
      })
    }

    return res.json({
      posts: result,
    })
  } catch (error) {
    console.error('List wing community posts error:', error)

    return res.status(500).json({
      message: 'Failed to load wing discussions',
    })
  }
}


// Get discussions for entire society
async function listSocietyPosts(req, res) {
  try {
    const result = await communityService.listSocietyPosts(
      req.user,
    )

    if (result?.error) {
      return res.status(400).json({
        message: result.error,
      })
    }

    return res.json({
      posts: result,
    })
  } catch (error) {
    console.error(
      'List society community posts error:',
      error,
    )

    return res.status(500).json({
      message: 'Failed to load society discussions',
    })
  }
}


// Get one discussion
async function getPost(req, res) {
  try {
    const post = await communityService.findPost(
      req.user,
      req.params.id,
    )

    if (!post) {
      return res.status(404).json({
        message: 'Community post not found',
      })
    }

    return res.json({
      post,
    })
  } catch (error) {
    console.error('Get community post error:', error)

    return res.status(500).json({
      message: 'Failed to load community post',
    })
  }
}


// Add comment
async function addComment(req, res) {
  try {
    const result = await communityService.addComment(
      req.user,
      req.params.id,
      req.body,
    )

    if (result.error) {
      return res.status(400).json({
        message: result.error,
      })
    }

    return res.status(201).json(result)
  } catch (error) {
    console.error('Add community comment error:', error)

    return res.status(500).json({
      message: 'Failed to add comment',
    })
  }
}


// Get comments
async function listComments(req, res) {
  try {
    const comments = await communityService.listComments(
      req.user,
      req.params.id,
    )

    if (!comments) {
      return res.status(404).json({
        message: 'Community post not found',
      })
    }

    return res.json({
      comments,
    })
  } catch (error) {
    console.error(
      'List community comments error:',
      error,
    )

    return res.status(500).json({
      message: 'Failed to load comments',
    })
  }
}


// Delete user's own post
async function deletePost(req, res) {
  try {
    const deletedPost =
      await communityService.deletePost(
        req.user,
        req.params.id,
      )

    if (!deletedPost) {
      return res.status(404).json({
        message:
          'Post not found or you are not allowed to delete it',
      })
    }

    return res.json({
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Delete community post error:', error)

    return res.status(500).json({
      message: 'Failed to delete community post',
    })
  }
}


// Delete user's own comment
async function deleteComment(req, res) {
  try {
    const deletedComment =
      await communityService.deleteComment(
        req.user,
        req.params.id,
      )

    if (!deletedComment) {
      return res.status(404).json({
        message:
          'Comment not found or you are not allowed to delete it',
      })
    }

    return res.json({
      message: 'Comment deleted successfully',
    })
  } catch (error) {
    console.error(
      'Delete community comment error:',
      error,
    )

    return res.status(500).json({
      message: 'Failed to delete comment',
    })
  }
}


module.exports = {
  createPost,
  listWingPosts,
  listSocietyPosts,
  getPost,
  addComment,
  listComments,
  deletePost,
  deleteComment,
}
