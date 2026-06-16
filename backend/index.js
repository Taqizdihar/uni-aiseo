const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow requests from React frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const visualRoutes = require('./routes/visualRoutes');
const keywordRoutes = require('./routes/keywordRoutes');
const onpageRoutes = require('./routes/onpageRoutes');
const metatagRoutes = require('./routes/metatagRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const archiveRoutes = require('./routes/archiveRoutes');
const faqRoutes = require('./routes/faqRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/visual', visualRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/onpage', onpageRoutes);
app.use('/api/metatags', metatagRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('UNI-AISEO API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
