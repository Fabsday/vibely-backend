const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 


const register = async (req, res) => {
    const {username, email, password} = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({ message:'Semua data harus di isi!' });
    }

    try{
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if(existingUser.length > 0) {
            return res.status(400).json({message:'Username atau Email sudah digunakan' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log("PASSWORD ASLI DARI REACT:", password);
        console.log("PASSWORD SETELAH DI-HASH:", hashedPassword);

        await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        return res.status(201).json({ message: 'Akun berhasil dibuat'});

    } catch (error)  {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server.'});
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password harus diisi!' });
    }

    try {
        
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        const user = rows[0]; 

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        // 1. Tambahkan role ke dalam payload token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            'KUNCI_RAHASIA_NODI', 
            { expiresIn: '1h' }
        );
        
        // 2. Kirimkan juga data role-nya ke React
        return res.status(200).json({
            message: 'Login berhasil!',
            token: token,
            role: user.role 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { register, login };