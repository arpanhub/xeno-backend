const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());



app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/campaigns', require('./routes/campaign.routes'));
app.use('/api/segments', require('./routes/segment.routes'));
app.use('/api/message-logs', require('./routes/messageLog.routes'));
app.use('/api/genai', require('./routes/Genai.routes'));
app.use('/api/oauth', require('./routes/oauth.routes'));


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 