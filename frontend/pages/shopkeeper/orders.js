import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { orderAPI } from '../../lib/api';
import { logout, getUser } from '../../lib/auth';
import { Plus, LogOut, ShoppingBag, Clock, CheckCircle, Truck, Package } from 'lucide-react';

export default function ShopkeeperOrders() {
  const router = useRouter();
  const user = getUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    items: [{ name: '', quantity: 1, note: '' }]
  });

  useEffect(() => {
    if (!user || user.role !== 'shopkeeper') {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [router, user]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: '', quantity: 1, note: '' }]
    });
  };

  const handleRemoveItem = (index) => {
    const items = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...newOrder.items];
    items[index][field] = value;
    setNewOrder({ ...newOrder, items });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    try {
      const validItems = newOrder.items.filter(item => item.name && item.quantity);
      if (validItems.length === 0) {
        alert('Please add at least one item with name and quantity');
        return;
      }
      await orderAPI.create({ items: validItems });
      setShowCreateForm(false);
      setNewOrder({ items: [{ name: '', quantity: 1, note: '' }] });
      fetchOrders();
    } catch (error) {
      alert('Failed to create order: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'Purchased':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'Delivered':
        return <Truck className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800';
      case 'Purchased':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">My Orders</h1>
            <p className="text-blue-100 text-sm">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Create Order Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 flex items-center justify-center mb-6 shadow-lg"
        >
          <Plus className="w-6 h-6 mr-2" />
          {showCreateForm ? 'Cancel' : 'Create New Order'}
        </button>

        {/* Create Order Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2 text-green-600" />
              New Order
            </h2>
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {newOrder.items.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Item {index + 1}</span>
                    {newOrder.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Product name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-lg"
                    min="1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={item.note}
                    onChange={(e) => handleItemChange(index, 'note', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 font-medium"
              >
                + Add Another Item
              </button>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700"
              >
                Submit Order
              </button>
            </form>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order History</h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders yet</p>
              <p className="text-gray-400">Create your first order above</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.note && <p className="text-sm text-gray-500">Note: {item.note}</p>}
                      </div>
                      <span className="font-semibold text-gray-700">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
                {order.deliveryFeePaid !== undefined && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className={`text-sm font-medium ${order.deliveryFeePaid ? 'text-green-600' : 'text-red-600'}`}>
                      Delivery Fee: {order.deliveryFeePaid ? 'Paid' : 'Not Paid'}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
