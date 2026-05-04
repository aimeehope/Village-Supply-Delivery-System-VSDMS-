const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    note: {
      type: String,
      default: ''
    }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Purchased', 'Delivered'],
    default: 'Pending'
  },
  deliveryFeePaid: {
    type: Boolean,
    default: false
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
