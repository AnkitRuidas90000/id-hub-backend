const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
mongoose.set('strictQuery', true);

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb+srv://ANKIT:Sh9WH35UJFquBDId@cluster0.aqk7pvx.mongodb.net/idhub?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Request Schema
const requestSchema = new mongoose.Schema({
  gameName: String,
  appId: String,
  comments: String,
  timestamp: { type: Date, default: Date.now }
});
const Request = mongoose.model('Request', requestSchema);

// File Schema
const fileSchema = new mongoose.Schema({
  gameName: String,
  appId: String,
  filePath: String,
  timestamp: { type: Date, default: Date.now }
});
const File = mongoose.model('File', fileSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Routes
app.post('/api/requests', async (req, res) => {
  try {
    const { gameName, appId, comments } = req.body;
    const newRequest = new Request({ gameName, appId, comments });
    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

app.post('/api/files', upload.single('file'), async (req, res) => {
  try {
    const { gameName, appId } = req.body;
    const filePath = req.file.path;
    const newFile = new File({ gameName, appId, filePath });
    await newFile.save();
    res.status(201).json({ message: 'File uploaded successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.get('/api/files', async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));