# Village Supply & Delivery System (VSDMS)

A full-stack web application for managing product orders between village shopkeepers, a central family business (admin), and Kigali suppliers. This system replaces paper-based ordering with a simple, mobile-friendly digital solution.

## 🧠 Core Features

- **Role-based Authentication**: Shopkeeper, Admin, and Supplier roles
- **Order Management**: Shopkeepers create free-text product requests
- **Trip Management**: Admin groups orders into Kigali shopping trips
- **Supplier Coordination**: Send requests to suppliers and receive availability/pricing responses
- **Status Tracking**: Real-time order status updates (Pending → Approved → Purchased → Delivered)
- **Delivery Fee Tracking**: Simple paid/unpaid status for delivery fees
- **Mobile-First Design**: Optimized for non-technical users in rural areas

## 👥 User Roles

### 1. Shopkeeper
- Register/login with phone number
- Create product request orders (item name + quantity + notes)
- View order status in real-time
- Track delivery fee payment status

### 2. Admin (Family Business)
- View all shopkeeper orders
- Filter orders by status
- Update order status through the fulfillment cycle
- Group orders into "Trips" for Kigali purchasing
- Send trip items to suppliers
- View supplier responses
- Manage delivery logistics

### 3. Supplier (Kigali Vendor)
- Receive product requests from admin
- Respond per item with availability (Available/Not Available)
- Provide optional pricing
- Submit responses back to admin

## 🗄️ Database Schema

### Users
- id, name, phone, password, role, createdAt

### Orders
- id, userId, items (array), status, deliveryFeePaid, tripId, createdAt

### Trips
- id, orderIds (array), status, createdAt, completedAt

### SupplierRequests
- id, tripId, supplierId, items (array), status, createdAt

### SupplierResponses
- id, requestId, item, availability, price, createdAt

## 🧱 Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas (recommended)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vsdms
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🚀 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL
5. Deploy

### Backend (Render)

1. Push your code to GitHub
2. Create a new Web Service in Render
3. Connect your GitHub repository
4. Set the root directory to `backend`
5. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production
6. Deploy

### Database (MongoDB Atlas)

1. Create a free account at MongoDB Atlas
2. Create a new cluster
3. Create a database user
4. Whitelist your IP addresses (or use 0.0.0.0/0 for Render)
5. Get your connection string
6. Use it in your backend `MONGODB_URI` environment variable

## 📱 Usage

### First-Time Setup

1. **Register an Admin Account**:
   - Go to `/register`
   - Enter name, phone, password
   - Select role: "Admin (Family Business)"
   - This will be your main admin account

2. **Register Shopkeepers**:
   - Each shopkeeper registers with their phone number
   - Select role: "Shopkeeper"

3. **Register Suppliers**:
   - Each supplier registers with their phone number
   - Select role: "Supplier (Kigali Vendor)"

### Daily Workflow

**For Shopkeepers:**
1. Login with phone number and password
2. Click "Create New Order"
3. Add items (product name, quantity, optional notes)
4. Submit order
5. Monitor order status on "My Orders" page

**For Admin:**
1. Login as admin
2. View incoming orders on Dashboard
3. Approve orders by changing status to "Approved"
4. Select multiple orders and create a "Trip"
5. Go to Supplier Management page
6. Select a trip and send to a supplier
7. View supplier responses
8. Update trip status as you progress (Purchasing → In Transit → Completed)
9. Update individual order status to "Delivered" when complete
10. Toggle delivery fee payment status

**For Suppliers:**
1. Login as supplier
2. View incoming requests on Supplier Requests page
3. Click "Respond" on pending requests
4. For each item, select availability (Available/Not Available)
5. Optionally add price in RWF
6. Submit response

## 🎯 Key Design Decisions

- **No Product Catalog**: Shopkeepers use free-text input for maximum flexibility
- **Mobile-First UI**: Large buttons, simple navigation for non-technical users
- **Simple Authentication**: Phone number-based login (easy to remember)
- **Status-Based Workflow**: Clear progression from order to delivery
- **Trip Grouping**: Efficiently combine multiple orders for Kigali trips
- **Supplier Responses**: Simple availability/pricing system

## 🔒 Security Notes

- Change `JWT_SECRET` in production to a strong random string
- Use HTTPS in production
- Implement rate limiting for API endpoints (recommended)
- Add input validation and sanitization (recommended)
- Use environment variables for sensitive data

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check port 5000 is not in use

**Frontend can't connect to backend:**
- Verify NEXT_PUBLIC_API_URL in .env.local
- Check backend is running
- Check CORS settings in backend

**Authentication errors:**
- Clear browser localStorage
- Verify JWT_SECRET matches between requests
- Check token expiration (7 days default)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Orders
- `POST /api/orders` - Create order (shopkeeper)
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/my-orders` - Get my orders (shopkeeper)
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status (admin)
- `PATCH /api/orders/:id/delivery-fee` - Update delivery fee (admin)

### Trips
- `POST /api/trips` - Create trip (admin)
- `GET /api/trips` - Get all trips (admin)
- `GET /api/trips/:id` - Get single trip (admin)
- `PATCH /api/trips/:id/status` - Update trip status (admin)

### Suppliers
- `POST /api/suppliers/request` - Create supplier request (admin)
- `GET /api/suppliers/my-requests` - Get my requests (supplier)
- `GET /api/suppliers/requests` - Get all requests (admin)
- `POST /api/suppliers/response` - Submit response (supplier)
- `GET /api/suppliers/responses/:requestId` - Get responses (admin)

## 📄 License

This project is built for the village supply and delivery use case. Feel free to modify and adapt for your needs.

## 🤝 Support

For issues or questions, please contact the development team or refer to the documentation above.
