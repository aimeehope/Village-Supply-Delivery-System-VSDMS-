const express = require('express');
const SupplierRequest = require('../models/SupplierRequest');
const SupplierResponse = require('../models/SupplierResponse');
const Trip = require('../models/Trip');
const Order = require('../models/Order');
const { adminAuth, supplierAuth } = require('../middleware/auth');

const router = express.Router();

// Create supplier request (admin only)
router.post('/request', adminAuth, async (req, res) => {
  try {
    const { tripId, supplierId, items } = req.body;

    if (!tripId || !supplierId || !items) {
      return res.status(400).json({ message: 'Trip ID, supplier ID, and items are required' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const request = new SupplierRequest({
      tripId,
      supplierId,
      items,
      status: 'Pending'
    });

    await request.save();

    // Update trip status
    await Trip.findByIdAndUpdate(tripId, { status: 'Sent to Suppliers' });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get supplier requests for logged-in supplier
router.get('/my-requests', supplierAuth, async (req, res) => {
  try {
    const requests = await SupplierRequest.find({ supplierId: req.user._id })
      .populate('tripId')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all supplier requests (admin only)
router.get('/requests', adminAuth, async (req, res) => {
  try {
    const requests = await SupplierRequest.find()
      .populate('tripId')
      .populate('supplierId', 'name phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit supplier response
router.post('/response', supplierAuth, async (req, res) => {
  try {
    const { requestId, item, availability, price } = req.body;

    if (!requestId || !item || !availability) {
      return res.status(400).json({ message: 'Request ID, item, and availability are required' });
    }

    if (!['Available', 'Not Available'].includes(availability)) {
      return res.status(400).json({ message: 'Invalid availability status' });
    }

    const request = await SupplierRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.supplierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const response = new SupplierResponse({
      requestId,
      item,
      availability,
      price: price || null
    });

    await response.save();

    // Update request status if it's the first response
    if (request.status === 'Pending') {
      request.status = 'Responded';
      await request.save();
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get responses for a request (admin only)
router.get('/responses/:requestId', adminAuth, async (req, res) => {
  try {
    const responses = await SupplierResponse.find({ requestId: req.params.requestId })
      .sort({ createdAt: -1 });

    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
