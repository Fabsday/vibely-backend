const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Cek apakah ada header 'Authorization' di request dari React
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Akses Ditolak! Anda belum login.' });
    }

    // 2. Token biasanya dikirim dengan format "Bearer <token_acak_disini>"
    // Kita harus membelah string-nya untuk mengambil token aslinya saja
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Akses Ditolak! Format token tidak valid.' });
    }

    try {
        // 3. Cek keaslian token menggunakan kunci rahasia yang sama dengan saat Login
        const verified = jwt.verify(token, 'KUNCI_RAHASIA_NODI');
        
        // 4. Jika valid, simpan data user (id, username, role) ke dalam request (req)
        // Agar fungsi seperti likePost nanti bisa tahu siapa yang mengeklik Like
        req.user = verified; 
        
        // 5. Izinkan lewat (Lanjut ke controller)
        next(); 
    } catch (error) {
        return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa. Silakan login ulang.' });
    }
};

module.exports = verifyToken;