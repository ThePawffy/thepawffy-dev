# Pawffy Customer Backend API

A Node.js backend API for the Pawffy Customer App built with Firebase (Firestore + Authentication + Cloud Functions).

## 🏗️ Architecture

```
src/
├── config/
│   └── firebase.js          # Firebase configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── customerController.js # Customer operations
├── middleware/
│   └── index.js            # Validation, auth, error handling
├── models/
│   └── index.js            # Joi validation schemas
├── routes/
│   ├── index.js            # Main routes
│   ├── auth.js             # Auth routes
│   └── customer.js         # Customer routes
├── services/
│   ├── authService.js      # Firebase Auth operations
│   └── userService.js      # Firestore user operations
├── utils/
│   ├── index.js            # Utility functions
│   └── logger.js           # Winston logger
├── app.js                  # Express app setup
└── index.js               # Server entry point
```

## 🚀 Features

### 1. **OTP Authentication Flow**
- Phone number-based OTP login
- Firebase Authentication integration
- Automatic user creation and management

### 2. **Customer Registration**
- Complete profile setup after OTP verification
- Address management
- Terms and conditions acceptance
- Pet information storage

### 3. **User Management**
- Profile CRUD operations
- Multiple address support
- FCM token management for push notifications
- Pet management system

## 📱 API Endpoints

### Authentication
```
POST /api/auth/send-otp          # Send OTP to phone number
POST /api/auth/verify-otp        # Verify OTP and login/register
POST /api/auth/refresh-token     # Refresh authentication token
POST /api/auth/logout           # Logout user
```

### Customer Management
```
POST /api/customer/register      # Complete customer registration
GET  /api/customer/profile       # Get customer profile
PUT  /api/customer/profile       # Update customer profile
POST /api/customer/address       # Add new address
PUT  /api/customer/selected-address # Update selected address
POST /api/customer/pet           # Add new pet
PUT  /api/customer/fcm-token     # Update FCM token
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Firebase project with Firestore and Authentication enabled
- Firebase service account key

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd pawffy-customer-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

4. **Add Firebase Service Account**
```bash
# Download service account key from Firebase Console
# Place it as src/config/serviceAccountKey.json
```

5. **Start development server**
```bash
npm run dev
```

### Firebase Deployment

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase (if not already done)**
```bash
firebase init
```

4. **Deploy to Firebase**
```bash
npm run deploy
```

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=development
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

### Firebase Configuration
- Firestore database for user data
- Firebase Authentication for OTP verification
- Cloud Functions for API hosting
- Security rules for data access control

## 📊 Data Models

### User Model
```javascript
{
  id: "firebase-uid",
  phoneNumber: "+919876543210",
  name: "John Doe",
  description: "Pet lover",
  profileImage: "https://...",
  isActive: true,
  role: "customer",
  addresses: [...],
  selectedAddress: {...},
  pets: [...],
  termsConfirmation: {
    accepted: true,
    acceptedAt: "2025-09-21T10:00:00Z"
  },
  subscription: {
    planId: "",
    isActive: false
  },
  createdAt: "timestamp"
}
```

### Address Model
```javascript
{
  full_address: "123, MG Road",
  latitude: 12.9716,
  longitude: 77.5946,
  postal_code: "560001",
  city: "Bangalore",
  state: "Karnataka",
  country: "India",
  tag: "Home"
}
```

### Pet Model
```javascript
{
  id: "pet-id",
  name: "Buddy",
  type: "Dog",
  breed: "Golden Retriever",
  age: 3,
  gender: "Male",
  profileImage: "https://..."
}
```

## 🔐 Security Features

- Firebase Authentication integration
- JWT token validation
- Firestore security rules
- Input validation with Joi
- CORS configuration
- Rate limiting ready
- Helmet security headers

## 📝 Usage Flow

### New User Flow
1. User enters phone number
2. OTP sent via Firebase Auth
3. User verifies OTP
4. System creates dummy user record
5. User completes registration
6. Redirect to Home Screen

### Existing User Flow
1. User enters phone number
2. OTP sent via Firebase Auth
3. User verifies OTP
4. System finds existing user
5. Direct login to Home Screen

## 🧪 Testing

### Health Check
```bash
GET /api/health
```

### Sample OTP Verification (Development)
```javascript
{
  "phoneNumber": "+919876543210",
  "verificationId": "verify_123...",
  "otp": "123456"  // Use this OTP in development
}
```

## 📚 Additional Features

### Cloud Functions
- User creation triggers
- Data validation triggers
- Notification triggers
- Background processing

### Monitoring & Logging
- Winston logger integration
- Request/response logging
- Error tracking
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4