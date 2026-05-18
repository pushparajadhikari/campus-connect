const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadImages } = require('../middleware/upload');
const {
  getPosts, getPost, createPost, updatePost, deletePost, getUserPosts, getCategories, postValidation,
} = require('../controllers/postController');
const { toggleLike, toggleBookmark, getBookmarks } = require('../controllers/likeBookmarkController');

router.get('/categories', getCategories);
router.get('/', optionalAuth, getPosts);
router.get('/bookmarks', authenticate, getBookmarks);
router.get('/user/:userId', getUserPosts);
router.get('/:id', optionalAuth, getPost);
router.post('/', authenticate, uploadImages, postValidation, validate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:postId/like', authenticate, toggleLike);
router.post('/:postId/bookmark', authenticate, toggleBookmark);

module.exports = router;
