const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Allow public access to uploads
app.use('/uploads', express.static('uploads'));

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Schedule file deletion after 1 hour
    setTimeout(() => {
        fs.unlink(path.join(uploadDir, req.file.filename), (err) => {
            if (err) console.error('Error deleting file:', err);
            else console.log(`Deleted file: ${req.file.filename}`);
        });
    }, 3600 * 1000); // 1 hour

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ fileUrl });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('🚀 File Upload Server is running!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

