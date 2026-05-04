const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  orderIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  status: {
    type: String,
    enum: ['Planning', 'Sent to Suppliers', 'Purchasing', 'In Transit', 'Completed'],
    default: 'Planning'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Trip', tripSchema);
