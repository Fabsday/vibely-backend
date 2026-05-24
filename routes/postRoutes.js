const express = require('express');
const router = express.Router();
const { getPosts, createPost, deletePost, updatePost, likePost, getComments, addComment } = require('../controllers/postControlller'); 
const upload = require('../middleware/upload');
const verifyToken = require('../middleware/authMiddleware'); 

router.get('/', getPosts);
router.post('/', verifyToken, upload.single('image'), createPost);
router.delete('/:id', deletePost);
router.put('/:id', updatePost);
router.post('/:id/like', verifyToken, likePost);
router.get('/:id/comments', getComments);
router.post('/:id/comments', verifyToken, addComment);
module.exports = router;