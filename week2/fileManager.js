const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const STORAGE_DIR = path.join(__dirname, 'storage');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR);
}

// Create a file
app.post('/files', (req, res) => {
  try {
    const { filename, content } = req.body;
    
    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content are required' });
    }
    
    const filePath = path.join(STORAGE_DIR, filename);
    
    fs.writeFileSync(filePath, content);
    
    res.status(201).json({ message: `File '${filename}' created successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a file
app.get('/files/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(STORAGE_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `File '${filename}' not found` });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    res.status(200).json({ filename, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a file
app.delete('/files/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(STORAGE_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `File '${filename}' not found` });
    }
    
    fs.unlinkSync(filePath);
    
    res.status(200).json({ message: `File '${filename}' deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all files
app.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(STORAGE_DIR);
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`File management server running on port ${PORT}`);
});
