import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supplierAPI, tripAPI, authAPI } from '../../lib/api';
import { logout, getUser } from '../../lib/auth';
import { LogOut, ArrowLeft, Send, Users, CheckCircle, XCircle, DollarSign } from 'lucide-react';

export default function AdminSuppliers() {
  const router = useRouter();
  const user = getUser();
  const [trips, setTrips] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequestResponses, setSelectedRequestResponses] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router, user]);

  const fetchData = async () => {
    try {
      const [tripsRes, requestsRes, suppliersRes] = await Promise.all([
        tripAPI.getAll(),
        supplierAPI.getAllRequests(),
        authAPI.getSuppliers()
      ]);
      setTrips(tripsRes.data);
      setRequests(requestsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedTrip || !selectedSupplier) {
      alert('Please select a trip and supplier');
      return;
    }

    // Collect all items from orders in the trip
    const items = [];
    selectedTrip.orderIds?.forEach(order => {
      order.items?.forEach(item => {
        items.push({
          orderId: order._id,
          itemName: item.name,
          quantity: item.quantity,
          note: item.note
        });
      });
    });

    if (items.length === 0) {
      alert('No items found in this trip');
      return;
    }

    try {
      await supplierAPI.createRequest({
        tripId: selectedTrip._id,
        supplierId: selectedSupplier,
        items
      });
      setShowRequestForm(false);
      setSelectedTrip(null);
      setSelectedSupplier('');
      fetchData();
    } catch (error) {
      alert('Failed to create request: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleViewResponses = async (requestId) => {
    try {
      const response = await supplierAPI.getResponses(requestId);
      setSelectedRequestResponses({
        requestId,
        responses: response.data
      });
    } catch (error) {
      alert('Failed to fetch responses: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Responded': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="mr-4 flex items-center text-blue-200 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-bold">Supplier Management</h1>
              <p className="text-blue-200 text-sm">Manage supplier requests</p>
            </div>
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

      <div className="max-w-4xl mx-auto p-4">
        {/* Create Request Button */}
        <button
          onClick={() => setShowRequestForm(true)}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 flex items-center justify-center mb-6 shadow-lg"
        >
          <Send className="w-6 h-6 mr-2" />
          Send Request to Supplier
        </button>

        {/* Requests List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Supplier Requests
          </h2>
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No supplier requests yet</p>
              <p className="text-gray-400">Create a trip and send requests to suppliers</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      Supplier: {request.supplierId?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Sent: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewResponses(request._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    View Responses
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-700 mb-3">Items Requested:</p>
                  {request.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{item.itemName}</p>
                        {item.note && <p className="text-sm text-gray-500">Note: {item.note}</p>}
                      </div>
                      <span className="font-semibold text-gray-700">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Request Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Send className="w-6 h-6 mr-2 text-green-600" />
              Send Request to Supplier
            </h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Trip
                </label>
                <select
                  value={selectedTrip?._id || ''}
                  onChange={(e) => {
                    const trip = trips.find(t => t._id === e.target.value);
                    setSelectedTrip(trip);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a trip</option>
                  {trips.filter(t => t.status !== 'Completed').map(trip => (
                    <option key={trip._id} value={trip._id}>
                      Trip {new Date(trip.createdAt).toLocaleDateString()} - {trip.orderIds?.length} orders
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Supplier
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name} - {supplier.phone}
                    </option>
                  ))}
                </select>
              </div>
              {selectedTrip && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-700 mb-2">Items to be requested:</p>
                  <p className="text-sm text-gray-600">
                    {selectedTrip.orderIds?.reduce((total, order) => total + (order.items?.length || 0), 0)} items from {selectedTrip.orderIds?.length} orders
                  </p>
                </div>
              )}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestForm(false);
                    setSelectedTrip(null);
                    setSelectedSupplier('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Responses Modal */}
      {selectedRequestResponses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
              Supplier Responses
            </h2>
            {selectedRequestResponses.responses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No responses yet</p>
            ) : (
              <div className="space-y-3">
                {selectedRequestResponses.responses.map((response, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-800">{response.item}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        response.availability === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {response.availability}
                      </span>
                    </div>
                    {response.price && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {response.price} RWF
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setSelectedRequestResponses(null)}
              className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
