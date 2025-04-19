const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
mongoose.set('strictQuery', true); // Fix the strictQuery warning

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://ANKIT:GnWnPUeqfgDJMttX@ac-h8ek3ux-shard-00-00.aqk7pvx.mongodb.net:27017,ac-h8ek3ux-shard-00-01.aqk7pvx.mongodb.net:27017,ac-h8ek3ux-shard-00-02.aqk7pvx.mongodb.net:27017/idhub?ssl=true&replicaSet=atlas-osji8u-shard-0&authSource=admin&retryWrites=true&w=majority')
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