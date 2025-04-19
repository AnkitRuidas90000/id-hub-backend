const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Add CORS
const app = express();

// Middleware
app.use(cors()); // Allow frontend to call backend
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    'mongodb+srv://ANKIT:mkf0CHjSiA8xL0@cluster0.ak7pvx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

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

// Routes for Files (Recently Uploaded and Search)
app.get('/api/files', async (req, res) => {
  try {
    const { appId } = req.query;
    const query = appId ? { appId } : {};
    const files = await File.find(query);
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

// Route for File Upload (Admin Panel)
app.post('/api/files', async (req, res) => {
  try {
    const { gameName, appId, downloadUrl } = req.body;
    if (!gameName || !appId || !downloadUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const file = new File({ gameName, appId, downloadUrl });
    await file.save();
    res.json({ message: 'File uploaded successfully!' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Routes for Requests (Request Games)
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const { gameName, appId, comments } = req.body;
    if (!gameName) {
      return res.status(400).json({ message: 'Game Name is required' });
    }
    const request = new Request({ gameName, appId, comments });
    await request.save();
    res.json({ message: 'Request submitted successfully!' });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ message: 'Error submitting request' });
  }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});