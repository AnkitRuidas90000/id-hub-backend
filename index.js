const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary Config
cloudinary.config({
  cloud_name: 'clodki3jmtpfud',
  api_key: '933819123159934',
  api_secret: 'cKnHvPSs2tpnW79c8n3-gZaRorM'
});

// MongoDB Connection
mongoose.connect('mongodb+srv://ANKIT:mkfoCHjsIIAbxLMO@cluster0.aqk7pvx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// File Schema
const fileSchema = new mongoose.Schema({
  gameName: String,
  appId: String,
  downloadUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const File = mongoose.model('File', fileSchema);

// Request Schema
const requestSchema = new mongoose.Schema({
  gameName: String,
  appId: String,
  comments: String,
  createdAt: { type: Date, default: Date.now }
});
const Request = mongoose.model('Request', requestSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Upload API
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { gameName, appId } = req.body;
    const file = req.file;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'id-hub-files', resource_type: 'raw' },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    // Save to MongoDB
    const newFile = new File({ gameName, appId, downloadUrl: result.secure_url });
    await newFile.save();

    res.json({ message: 'File uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get Files API
app.get('/api/files', async (req, res) => {
  const { appId } = req.query;
  const files = await File.find(appId ? { appId } : {}).sort({ createdAt: -1 });
  res.json(files);
});

// Request Game API
app.post('/api/requests', async (req, res) => {
  try {
    const { gameName, appId, comments } = req.body;
    const newRequest = new Request({ gameName, appId, comments });
    await newRequest.save();
    res.json({ message: 'Game request submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting request' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));