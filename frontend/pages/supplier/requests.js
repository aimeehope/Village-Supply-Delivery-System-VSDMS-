import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supplierAPI } from '../../lib/api';
import { logout, getUser } from '../../lib/auth';
import { LogOut, Inbox, Send, CheckCircle, XCircle, DollarSign } from 'lucide-react';

export default function SupplierRequests() {
  const router = useRouter();
  const user = getUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responses, setResponses] = useState({});
  const [showResponseForm, setShowResponseForm] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'supplier') {
      router.push('/login');
      return;
    }
    fetchRequests();
  }, [router, user]);

  const fetchRequests = async () => {
    try {
      const response = await supplierAPI.getMyRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const item of selectedRequest.items) {
        const response = responses[item._id || item.itemName];
        if (response) {
          await supplierAPI.submitResponse({
            requestId: selectedRequest._id,
            item: item.itemName,
            availability: response.availability,
            price: response.price || null
          });
        }
      }
      setShowResponseForm(false);
      setSelectedRequest(null);
      setResponses({});
      fetchRequests();
    } catch (error) {
      alert('Failed to submit response: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleResponseChange = (itemKey, field, value) => {
    setResponses(prev => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [field]: value
      }
    }));
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
      <div className="bg-purple-600 text-white p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Supplier Requests</h1>
            <p className="text-purple-200 text-sm">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center bg-purple-700 px-4 py-2 rounded-lg hover:bg-purple-800"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Requests List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Inbox className="w-6 h-6 mr-2 text-purple-600" />
            Incoming Requests
          </h2>
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No requests yet</p>
              <p className="text-gray-400">Wait for admin to send you product requests</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      Received: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {request.status === 'Pending' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowResponseForm(true);
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Respond
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-700 mb-3">Requested Items:</p>
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

      {/* Response Form Modal */}
      {showResponseForm && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Send className="w-6 h-6 mr-2 text-purple-600" />
              Respond to Request
            </h2>
            <form onSubmit={handleResponseSubmit} className="space-y-4">
              {selectedRequest.items.map((item, index) => {
                const itemKey = item._id || item.itemName;
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-800">{item.itemName}</p>
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <select
                        value={responses[itemKey]?.availability || ''}
                        onChange={(e) => handleResponseChange(itemKey, 'availability', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select availability</option>
                        <option value="Available">Available</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </div>
                    {responses[itemKey]?.availability === 'Available' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (RWF) - Optional
                        </label>
                        <input
                          type="number"
                          value={responses[itemKey]?.price || ''}
                          onChange={(e) => handleResponseChange(itemKey, 'price', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter price"
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResponseForm(false);
                    setSelectedRequest(null);
                    setResponses({});
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
