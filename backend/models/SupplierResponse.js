const mongoose = require('mongoose');

const supplierResponseSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplierRequest',
    required: true
  },
  item: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    enum: ['Available', 'Not Available'],
    required: true
  },
  price: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SupplierResponse', supplierResponseSchema);
