import { useEffect, useMemo, useState } from 'react'
import { communityApi } from '../../../services/api'
import './community.css'

export default function Community() {
  const [activeSpace, setActiveSpace] = useState('WING')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Create discussion
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Expanded discussion
  const [expandedPostId, setExpandedPostId] = useState(null)
  const [comments, setComments] = useState({})
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')

  // Reply
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)

  // Logged-in user
  const user = JSON.parse(
    localStorage.getItem('sociohub_user') || '{}'
  )

  // Some login responses may store the ID as "id"
  // while others may use "_id".
  // This supports both formats.
  const currentUserId = user._id || user.id

  // =========================
  // LOAD POSTS
  // =========================

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')

      const result =
        activeSpace === 'WING'
          ? await communityApi.getWingPosts()
          : await communityApi.getSocietyPosts()

      setPosts(result.posts || [])
    } catch (requestError) {
      setError(
        requestError.message ||
          'Failed to load community discussions.'
      )
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const request = activeSpace === 'WING'
      ? communityApi.getWingPosts()
      : communityApi.getSocietyPosts()
    request
      .then((result) => { if (active) setPosts(result.posts || []) })
      .catch((requestError) => {
        if (!active) return
        setError(requestError.message || 'Failed to load discussions.')
        setPosts([])
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [activeSpace])

  function changeSpace(space) {
    setLoading(true)
    setError('')
    setExpandedPostId(null)
    setCommentsError('')
    setReplyText('')
    setActiveSpace(space)
  }

  // =========================
  // SPACE INFORMATION
  // =========================

  const spaceTitle =
    activeSpace === 'WING'
      ? 'My Wing'
      : 'Entire Society'

  const spaceDescription =
    activeSpace === 'WING'
      ? 'Connect with residents from your wing.'
      : 'Join conversations happening across your society.'

  // =========================
  // FORMAT POSTS
  // =========================

  const formattedPosts = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      authorName: post.authorId?.name || 'Resident',
      authorRole: post.authorId?.role || 'RESIDENT',
      wingName: post.wingId?.name || '',
    }))
  }, [posts])

  // =========================
  // CREATE DISCUSSION
  // =========================

  const openCreateModal = () => {
    setTitle('')
    setContent('')
    setCreateError('')
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    if (creating) return

    setShowCreateModal(false)
    setTitle('')
    setContent('')
    setCreateError('')
  }

  const handleCreatePost = async (event) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      setCreateError('Please enter a discussion title.')
      return
    }

    if (trimmedTitle.length < 3) {
      setCreateError(
        'Title must be at least 3 characters.'
      )
      return
    }

    if (!trimmedContent) {
      setCreateError('Please enter your discussion.')
      return
    }

    setCreating(true)
    setCreateError('')

    try {
      await communityApi.createPost({
        scope: activeSpace,
        title: trimmedTitle,
        content: trimmedContent,
      })

      setShowCreateModal(false)
      setTitle('')
      setContent('')

      await loadPosts()
    } catch (requestError) {
      setCreateError(
        requestError.message ||
          'Failed to create discussion.'
      )
    } finally {
      setCreating(false)
    }
  }

  // =========================
  // OPEN / CLOSE DISCUSSION
  // =========================

  const toggleDiscussion = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null)
      setCommentsError('')
      setReplyText('')
      return
    }

    setExpandedPostId(postId)
    setCommentsError('')
    setReplyText('')

    // Already loaded
    if (comments[postId]) {
      return
    }

    try {
      setCommentsLoading(true)

      const result =
        await communityApi.getComments(postId)

      setComments((previous) => ({
        ...previous,
        [postId]: result.comments || [],
      }))
    } catch (requestError) {
      setCommentsError(
        requestError.message ||
          'Failed to load replies.'
      )
    } finally {
      setCommentsLoading(false)
    }
  }

  // =========================
  // ADD REPLY
  // =========================

  const handleAddReply = async (event, postId) => {
    event.preventDefault()

    const trimmedReply = replyText.trim()

    if (!trimmedReply) {
      return
    }

    setReplying(true)
    setCommentsError('')

    try {
      const result =
        await communityApi.addComment(postId, {
          content: trimmedReply,
        })

      setComments((previous) => ({
        ...previous,
        [postId]: [
          ...(previous[postId] || []),
          result.comment,
        ],
      }))

      setReplyText('')
    } catch (requestError) {
      setCommentsError(
        requestError.message ||
          'Failed to add reply.'
      )
    } finally {
      setReplying(false)
    }
  }

  // =========================
  // DELETE DISCUSSION
  // =========================

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this discussion?'
    )

    if (!confirmed) return

    try {
      await communityApi.deletePost(postId)

      setPosts((previous) =>
        previous.filter(
          (post) => post._id !== postId
        )
      )

      setExpandedPostId(null)

      setComments((previous) => {
        const updated = { ...previous }
        delete updated[postId]
        return updated
      })

      setCommentsError('')
    } catch (requestError) {
      setError(
        requestError.message ||
          'Failed to delete discussion.'
      )
    }
  }

  // =========================
  // DELETE REPLY
  // =========================

  const handleDeleteComment = async (
    commentId,
    postId
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this reply?'
    )

    if (!confirmed) return

    try {
      await communityApi.deleteComment(commentId)

      setComments((previous) => ({
        ...previous,
        [postId]: (
          previous[postId] || []
        ).filter(
          (comment) => comment._id !== commentId
        ),
      }))
    } catch (requestError) {
      setCommentsError(
        requestError.message ||
          'Failed to delete reply.'
      )
    }
  }

  // =========================
  // ROLE LABEL
  // =========================

  const getRoleLabel = (role) => {
    if (role === 'OWNER') return 'Owner'
    if (role === 'TENANT') return 'Tenant'
    if (role === 'ADMIN') return 'Admin'
    if (role === 'WATCHMAN') return 'Watchman'

    return 'Resident'
  }

  return (
    <section className="community-page">

      {/* ========================= */}
      {/* COMMUNITY HEADER */}
      {/* ========================= */}

      <div className="community-header">

        <div>
          <p className="page-kicker">
            Neighbourhood space
          </p>

          <h1>
            Community
          </h1>

          <p className="community-intro">
            Connect with your neighbours, share ideas,
            ask questions and stay involved in your
            community.
          </p>
        </div>

        <div className="community-user">

          <div className="community-avatar">
            {user.name?.charAt(0)?.toUpperCase() || 'R'}
          </div>

          <div>
            <strong>
              {user.name || 'Resident'}
            </strong>

            <span>
              {getRoleLabel(user.role)}
            </span>
          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* COMMUNITY SPACE SWITCHER */}
      {/* ========================= */}

      <div className="community-spaces">

        <button
          type="button"
          className={`community-space ${
            activeSpace === 'WING'
              ? 'active'
              : ''
          }`}
          onClick={() => changeSpace('WING')}
        >
          <span className="space-icon">
            🏢
          </span>

          <span className="space-content">
            <strong>
              My Wing
            </strong>

            <small>
              Discussions with your wing neighbours
            </small>
          </span>

          <span className="space-arrow">
            →
          </span>
        </button>

        <button
          type="button"
          className={`community-space ${
            activeSpace === 'SOCIETY'
              ? 'active'
              : ''
          }`}
          onClick={() => changeSpace('SOCIETY')}
        >
          <span className="space-icon">
            🏙️
          </span>

          <span className="space-content">
            <strong>
              Entire Society
            </strong>

            <small>
              Discussions open to everyone
            </small>
          </span>

          <span className="space-arrow">
            →
          </span>
        </button>

      </div>

      {/* ========================= */}
      {/* DISCUSSION TOOLBAR */}
      {/* ========================= */}

      <div className="community-toolbar">

        <div>
          <p className="page-kicker">
            {spaceTitle}
          </p>

          <h2>
            Recent discussions
          </h2>

          <p>
            {spaceDescription}
          </p>
        </div>

        <button
          type="button"
          className="community-create-button"
          onClick={openCreateModal}
        >
          <span>＋</span>
          Start a discussion
        </button>

      </div>

      {/* ========================= */}
      {/* ERROR */}
      {/* ========================= */}

      {error && (
        <div className="community-message error">

          <strong>
            Unable to load discussions
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={loadPosts}
          >
            Try again
          </button>

        </div>
      )}

      {/* ========================= */}
      {/* LOADING */}
      {/* ========================= */}

      {loading && !error && (
        <div className="community-list">

          {[1, 2, 3].map((item) => (
            <div
              className="community-skeleton"
              key={item}
            >
              <div className="skeleton-line short" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line long" />
              <div className="skeleton-line small" />
            </div>
          ))}

        </div>
      )}

      {/* ========================= */}
      {/* EMPTY STATE */}
      {/* ========================= */}

      {!loading &&
        !error &&
        formattedPosts.length === 0 && (
          <div className="community-empty">

            <div className="empty-icon">
              💬
            </div>

            <h3>
              Start the conversation
            </h3>

            <p>
              There are no discussions here yet.
              Be the first neighbour to start one.
            </p>

            <button
              type="button"
              className="community-create-button"
              onClick={openCreateModal}
            >
              ＋ Start a discussion
            </button>

          </div>
        )}

      {/* ========================= */}
      {/* POST LIST */}
      {/* ========================= */}

      {!loading &&
        !error &&
        formattedPosts.length > 0 && (

          <div className="community-list">

            {formattedPosts.map((post) => {

              const isExpanded =
                expandedPostId === post._id

              const postComments =
                comments[post._id] || []

              /*
               * IMPORTANT:
               * Show delete only when the logged-in
               * user's ID matches the post author's ID.
               *
               * Supports both:
               * user._id
               * user.id
               */
              const isPostOwner =
                String(post.authorId?._id) ===
                String(currentUserId)

              return (
                <article
                  className={`community-post-card ${
                    isExpanded
                      ? 'discussion-expanded'
                      : ''
                  }`}
                  key={post._id}
                >

                  {/* ========================= */}
                  {/* POST HEADER */}
                  {/* ========================= */}

                  <div className="post-top">

                    <div className="post-author">

                      <div className="post-avatar">
                        {post.authorName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {post.authorName}
                        </strong>

                        <span>
                          {getRoleLabel(
                            post.authorRole
                          )}

                          {post.scope === 'SOCIETY' &&
                            post.wingName &&
                            ` · Wing ${post.wingName}`}
                        </span>
                      </div>

                    </div>

                    <span className="post-scope">
                      {post.scope === 'WING'
                        ? `Wing ${post.wingName}`
                        : 'Entire Society'}
                    </span>

                  </div>

                  {/* ========================= */}
                  {/* POST CONTENT */}
                  {/* ========================= */}

                  <div className="post-body">

                    <h3>
                      {post.title}
                    </h3>

                    <p>
                      {post.content}
                    </p>

                  </div>

                  {/* ========================= */}
                  {/* POST FOOTER */}
                  {/* ========================= */}

                  <div className="post-footer">

                    <span>
                      💬{' '}
                      {isExpanded
                        ? 'Discussion open'
                        : 'Community discussion'}
                    </span>

                    <div className="post-footer-actions">

                      <button
                        type="button"
                        className="discussion-toggle"
                        onClick={() =>
                          toggleDiscussion(post._id)
                        }
                      >
                        {isExpanded
                          ? 'Close discussion ↑'
                          : 'Reply to this discussion →'}
                      </button>

                      {/* DELETE DISCUSSION */}
                      {isPostOwner && (
                        <button
                          type="button"
                          className="delete-discussion-button"
                          onClick={() =>
                            handleDeletePost(post._id)
                          }
                        >
                          🗑 Delete discussion
                        </button>
                      )}

                    </div>

                  </div>

                  {/* ========================= */}
                  {/* EXPANDED DISCUSSION */}
                  {/* ========================= */}

                  {isExpanded && (

                    <div className="discussion-thread">

                      <div className="thread-heading">

                        <div>
                          <p className="page-kicker">
                            Conversation
                          </p>

                          <h4>
                            Discussion replies
                          </h4>
                        </div>

                        <span>
                          {postComments.length}{' '}
                          {postComments.length === 1
                            ? 'reply'
                            : 'replies'}
                        </span>

                      </div>

                      {/* ========================= */}
                      {/* COMMENTS */}
                      {/* ========================= */}

                      {commentsLoading && (
                        <div className="comments-loading">
                          Loading replies...
                        </div>
                      )}

                      {!commentsLoading &&
                        postComments.length === 0 && (
                          <div className="no-comments">

                            <span>
                              💬
                            </span>

                            <div>
                              <strong>
                                No replies yet
                              </strong>

                              <p>
                                Be the first neighbour
                                to respond to this
                                discussion.
                              </p>
                            </div>

                          </div>
                        )}

                      {!commentsLoading &&
                        postComments.length > 0 && (

                          <div className="comment-list">

                            {postComments.map(
                              (comment) => {

                                const commentAuthor =
                                  comment.authorId?.name ||
                                  'Resident'

                                const commentRole =
                                  comment.authorId?.role ||
                                  'RESIDENT'

                                const isCommentOwner =
                                  String(
                                    comment.authorId?._id
                                  || comment.authorId) ===
                                  String(currentUserId)

                                return (
                                  <div
                                    className="comment-item"
                                    key={comment._id}
                                  >

                                    <div className="comment-avatar">
                                      {commentAuthor
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>

                                    <div className="comment-content">

                                      <div className="comment-meta">

                                        <div className="comment-author-info">

                                          <strong>
                                            {commentAuthor}
                                          </strong>

                                          <span>
                                            {getRoleLabel(
                                              commentRole
                                            )}
                                          </span>

                                        </div>

                                        {/* DELETE REPLY */}
                                    {isCommentOwner && (
  <button
    type="button"
    className="delete-comment-button"
    onClick={() =>
      handleDeleteComment(
        comment._id,
        post._id
      )
    }
    aria-label="Delete reply"
    title="Delete reply"
  >
    🗑️
  </button>
)}

                                      </div>

                                      <p>
                                        {comment.content}
                                      </p>

                                    </div>

                                  </div>
                                )
                              }
                            )}

                          </div>
                        )}

                      {/* ========================= */}
                      {/* COMMENT ERROR */}
                      {/* ========================= */}

                      {commentsError && (
                        <div className="community-form-error">
                          {commentsError}
                        </div>
                      )}

                      {/* ========================= */}
                      {/* REPLY FORM */}
                      {/* ========================= */}

                      <form
                        className="reply-form"
                        onSubmit={(event) =>
                          handleAddReply(
                            event,
                            post._id
                          )
                        }
                      >

                        <div className="reply-avatar">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || 'R'}
                        </div>

                        <div className="reply-input-area">

                          <textarea
                            value={replyText}
                            onChange={(event) =>
                              setReplyText(
                                event.target.value
                              )
                            }
                            placeholder="Write a reply to this discussion..."
                            rows={3}
                            maxLength={2000}
                            disabled={replying}
                          />

                          <div className="reply-form-bottom">

                            <span>
                              {replyText.length}/2000
                            </span>

                            <button
                              type="submit"
                              disabled={
                                replying ||
                                !replyText.trim()
                              }
                            >
                              {replying
                                ? 'Replying...'
                                : 'Post reply'}
                            </button>

                          </div>

                        </div>

                      </form>

                    </div>
                  )}

                </article>
              )
            })}

          </div>
        )}

      {/* ========================= */}
      {/* CREATE DISCUSSION MODAL */}
      {/* ========================= */}

      {showCreateModal && (

        <div
          className="community-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateModal()
            }
          }}
        >

          <div className="community-modal">

            <div className="community-modal-header">

              <div>
                <p className="page-kicker">
                  New discussion
                </p>

                <h2>
                  Start a conversation
                </h2>

                <p>
                  Share something useful with your
                  neighbours.
                </p>
              </div>

              <button
                type="button"
                className="community-modal-close"
                onClick={closeCreateModal}
                disabled={creating}
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <div className="community-modal-space">

              <span className="modal-space-icon">
                {activeSpace === 'WING'
                  ? '🏢'
                  : '🏙️'}
              </span>

              <div>
                <span>
                  Posting in
                </span>

                <strong>
                  {activeSpace === 'WING'
                    ? 'My Wing'
                    : 'Entire Society'}
                </strong>
              </div>

            </div>

            <form
              className="community-form"
              onSubmit={handleCreatePost}
            >

              <div className="community-form-field">

                <label htmlFor="discussion-title">
                  Discussion title
                </label>

                <input
                  id="discussion-title"
                  type="text"
                  placeholder="What would you like to discuss?"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  maxLength={150}
                  disabled={creating}
                  autoFocus
                />

                <small>
                  {title.length}/150
                </small>

              </div>

              <div className="community-form-field">

                <label htmlFor="discussion-content">
                  Your message
                </label>

                <textarea
                  id="discussion-content"
                  placeholder="Write your message here..."
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  maxLength={5000}
                  rows={6}
                  disabled={creating}
                />

                <small>
                  {content.length}/5000
                </small>

              </div>

              {createError && (
                <div className="community-form-error">
                  {createError}
                </div>
              )}

              <div className="community-modal-actions">

                <button
                  type="button"
                  className="community-cancel-button"
                  onClick={closeCreateModal}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="community-submit-button"
                  disabled={creating}
                >
                  {creating
                    ? 'Posting...'
                    : 'Post discussion'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  )
}
