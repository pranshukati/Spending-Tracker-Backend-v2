const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Payment Schema
const paymentSchema = new mongoose.Schema({
  payment: {
    type: Number,
    required: true
  },
  dateandtime: {
    type: String,
    default: () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

// POST endpoint - Create payment with JSON body
app.post('/payments', async (req, res) => {
  try {
    const { payment } = req.body;
    
    if (typeof payment !== 'number') {
      return res.status(400).json({ message: 'Payment must be a number' });
    }

    const newPayment = new Payment({ payment });
    const savedPayment = await newPayment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint - Create payment via URL parameter
app.get('/payments/create', async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount);
    
    if (isNaN(amount)) {
      return res.status(400).json({ 
        message: 'Invalid amount. Use format: /payments/create?amount=184' 
      });
    }

    const newPayment = new Payment({ payment: amount });
    const savedPayment = await newPayment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET endpoint - Get all payments
app.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ dateandtime: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});