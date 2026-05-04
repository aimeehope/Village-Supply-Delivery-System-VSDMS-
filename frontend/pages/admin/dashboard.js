import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { orderAPI, tripAPI } from '../../lib/api';
import { logout, getUser } from '../../lib/auth';
import { LogOut, LayoutDashboard, Package, Truck, Users, CheckCircle, XCircle, Filter, Plus, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const user = getUser();
  const [orders, setOrders] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showTripModal, setShowTripModal] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router, user, statusFilter]);

  const fetchData = async () => {
    try {
      const [ordersRes, tripsRes] = await Promise.all([
        orderAPI.getAll(statusFilter ? { status: statusFilter } : {}),
        tripAPI.getAll()
      ]);
      setOrders(ordersRes.data);
      setTrips(tripsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      fetchData();
    } catch (error) {
      alert('Failed to update status: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeliveryFeeToggle = async (orderId, currentStatus) => {
    try {
      await orderAPI.updateDeliveryFee(orderId, !currentStatus);
      fetchData();
    } catch (error) {
      alert('Failed to update delivery fee: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleCreateTrip = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select at least one order');
      return;
    }
    try {
      await tripAPI.create({ orderIds: selectedOrders });
      setShowTripModal(false);
      setSelectedOrders([]);
      fetchData();
    } catch (error) {
      alert('Failed to create trip: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleTripStatusUpdate = async (tripId, newStatus) => {
    try {
      await tripAPI.updateStatus(tripId, newStatus);
      fetchData();
    } catch (error) {
      alert('Failed to update trip status: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'Purchased': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Planning': 'bg-gray-100 text-gray-800',
      'Sent to Suppliers': 'bg-orange-100 text-orange-800',
      'Purchasing': 'bg-blue-100 text-blue-800',
      'In Transit': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'Pending').length,
    deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
    activeTrips: trips.filter(t => t.status !== 'Completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-200 text-sm">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center bg-blue-800 px-4 py-2 rounded-lg hover:bg-blue-900"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Trips</p>
                <p className="text-2xl font-bold text-purple-600">{stats.activeTrips}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'trips' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Trips
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Purchased">Purchased</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              {selectedOrders.length > 0 && (
                <button
                  onClick={() => setShowTripModal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Trip ({selectedOrders.length})
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleOrderSelect(order._id)}
                          className="mt-1 w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-medium text-gray-800">{order.userId?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{order.userId?.phone || ''}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Purchased">Purchased</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <button
                          onClick={() => handleDeliveryFeeToggle(order._id, order.deliveryFeePaid)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            order.deliveryFeePaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.deliveryFeePaid ? 'Fee Paid' : 'Fee Unpaid'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-gray-600">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === 'trips' && (
          <div className="space-y-4">
            {trips.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No trips found</p>
                <p className="text-gray-400">Select orders and create a trip to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div key={trip._id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                          Created: {new Date(trip.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <select
                        value={trip.status}
                        onChange={(e) => handleTripStatusUpdate(trip._id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="Planning">Planning</option>
                        <option value="Sent to Suppliers">Sent to Suppliers</option>
                        <option value="Purchasing">Purchasing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-700 mb-2">Orders in this trip ({trip.orderIds?.length || 0}):</p>
                      {trip.orderIds?.map((order) => (
                        <div key={order._id} className="text-sm text-gray-600 py-1">
                          {order.userId?.name} - {order.items?.length} items
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Trip Modal */}
      {showTripModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Trip</h2>
            <p className="text-gray-600 mb-4">
              You are about to create a trip with {selectedOrders.length} order(s).
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowTripModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrip}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
