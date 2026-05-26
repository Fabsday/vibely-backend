const db = require('../config/db');



const getPosts = async (req, res) => {
    try {
        // Tambahkan LEFT JOIN users untuk mengambil username
        const query = `
            SELECT posts.*, 
                   users.username,
                   COUNT(likes.id) AS likes_count 
            FROM posts
            LEFT JOIN users ON posts.user_id = users.id
            LEFT JOIN likes ON posts.id = likes.post_id
            GROUP BY posts.id
            ORDER BY posts.created_at DESC
        `;
        
        const [posts] = await db.query(query);
        return res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil postingan.' });
    }
};

const createPost = async (req, res) => {
    const { title, content } = req.body;
    const image = req.file ? req.file.path : null;
    
    
    const userId = req.user.id; 

    try {
        
        await db.query(
            'INSERT INTO posts (title, content, image, user_id) VALUES (?, ?, ?, ?)',
            [title, content, image, userId]
        );
        return res.status(201).json({ message: 'Postingan berhasil dibuat!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat postingan.' });
    }
};



const deletePost = async (req, res) => {
    const { id } = req.params; 

    try {
        const [rows] = await db.query('SELECT image FROM posts WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        }

        
        await db.query('DELETE FROM posts WHERE id = ?', [id]);
        
        return res.status(200).json({ message: 'Postingan berhasil dihapus bersih!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Gagal menghapus postingan.' });
    }
};


const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Judul dan konten tidak boleh kosong!' });
    }

    try {
        const [result] = await db.query(
            'UPDATE posts SET title = ?, content = ? WHERE id = ?',
            [title, content, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Postingan tidak ditemukan.' });
        }

        return res.status(200).json({ message: 'Postingan berhasil diperbarui!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Gagal memperbarui postingan.' });
    }
};


const likePost = async (req, res) => {
    
    const { id } = req.params; 
    
    const userId = req.user.id; 

    try {

        const [existingLike] = await db.query(
            'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
            [userId, id]
        );

        if (existingLike.length > 0) {
            
            await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, id]);
            return res.status(200).json({ message: 'Unlike berhasil', liked: false });
        } else {
            
            await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, id]);
            return res.status(201).json({ message: 'Like berhasil', liked: true });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};


const addComment = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id; 
    const { comment_text } = req.body;

    if (!comment_text || comment_text.trim() === '') {
        return res.status(400).json({ message: 'Komentar tidak boleh kosong!' });
    }

    try {
        await db.query(
            'INSERT INTO comments (user_id, post_id, comment_text) VALUES (?, ?, ?)',
            [userId, postId, comment_text]
        );
        return res.status(201).json({ message: 'Komentar berhasil ditambahkan!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};


const getComments = async (req, res) => {
    const postId = req.params.id;
    try {
        
        const query = `
            SELECT comments.*, users.username 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE post_id = ? 
            ORDER BY created_at ASC
        `;
        const [comments] = await db.query(query, [postId]);
        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil komentar.' });
    }
};


module.exports = { getPosts, createPost, deletePost, updatePost,  likePost, addComment, getComments };