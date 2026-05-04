const express = require('express');
const Trip = require('../models/Trip');
const Order = require('../models/Order');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create trip (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Order IDs are required' });
    }

    // Verify all orders exist and are not already in a trip
    const orders = await Order.find({ _id: { $in: orderIds } });
    if (orders.length !== orderIds.length) {
      return res.status(400).json({ message: 'One or more orders not found' });
    }

    const ordersInTrip = await Order.find({ 
      _id: { $in: orderIds },
      tripId: { $ne: null }
    });

    if (ordersInTrip.length > 0) {
      return res.status(400).json({ message: 'Some orders are already in a trip' });
    }

    const trip = new Trip({
      orderIds,
      status: 'Planning'
    });

    await trip.save();

    // Update orders with tripId
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { tripId: trip._id }
    );

    await trip.populate('orderIds');

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all trips (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('orderIds')
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update trip status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Planning', 'Sent to Suppliers', 'Purchasing', 'In Transit', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { status };
    if (status === 'Completed') {
      updateData.completedAt = new Date();
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('orderIds');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single trip
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('orderIds');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
