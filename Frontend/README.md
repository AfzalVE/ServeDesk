# ServeDesk Mobile App 📱

React Native (Expo) mobile application for the ServeDesk office service management system. Provides role-based interfaces for customers, employees, and administrators to manage orders, support tickets, and workflows.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [App Architecture](#app-architecture)
- [User Roles](#user-roles)
- [Key Screens](#key-screens)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Development](#development)

## ✨ Features

- **Role-Based UI**: Different interfaces for admins, employees, and customers
- **Order Management**: Create, track, and update orders in real-time
- **Support Tickets**: Submit and track support tickets
- **Product Catalog**: Browse available services/products
- **Employee Directory**: View and manage employee information
- **Announcements**: Receive system-wide announcements
- **Real-time Updates**: WebSocket support for live notifications
- **Push Notifications**: Firebase cloud messaging integration
- **Secure Authentication**: JWT-based user authentication
- **Offline Support**: AsyncStorage for local data persistence
- **Cross-Platform**: Works on iOS, Android, and Web

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React Native |
| Build Tool | Expo |
| Routing | Expo Router (File-based) |
| Language | TypeScript |
| State Management | React Context + AsyncStorage |
| UI Components | React Native + Custom Components |
| Navigation | React Navigation |
| Animations | Reanimated |
| Icons | Expo Vector Icons |
| Date Picker | React Native Community DateTime Picker |
| Notifications | Expo Notifications + Firebase |
| Async Storage | AsyncStorage |
| HTTP Client | Fetch API |

## 📥 Installation

### Prerequisites

- Node.js 16+ and npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator
- Expo Go app (for testing on physical devices)

### Step 1: Navigate to Frontend Directory

```bash
cd Frontend
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment

Create `config/.env.local` file (if needed for API endpoints):

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

## ⚙️ Configuration

### API Configuration

Edit [config/api.ts](config/api.ts):

```typescript
const API_BASE_URL = 'http://localhost:8000'; // Update to your backend URL
```

### Authentication

Update [lib/auth.ts](lib/auth.ts) for:
- JWT token management
- Login/logout logic
- User role detection

### Notifications

Configure [utils/notifications.ts](utils/notifications.ts):
- Firebase cloud messaging setup
- Push notification handling
- Local notification permissions

## 🚀 Running the App

### Start Development Server

```bash
npm start
# or
npx expo start
```

### Run on Android Emulator

```bash
npm run android
# or press 'a' in the Expo CLI
```

### Run on iOS Simulator (macOS only)

```bash
npm run ios
# or press 'i' in the Expo CLI
```

### Run on Web

```bash
npm run web
# or press 'w' in the Expo CLI
```

### Run on Physical Device

1. Install Expo Go app from App Store or Google Play
2. Scan QR code from `expo start` terminal output
3. App loads on your device

## 📁 Project Structure

```
Frontend/
├── app/                        # File-based routing directory
│   ├── _layout.tsx            # Root layout with providers
│   ├── index.tsx              # Home/splash screen
│   ├── modal.tsx              # Modal component
│   ├── settings.tsx           # Settings screen
│   │
│   ├── (auth)/                # Auth routes (no tabs)
│   │   ├── sign-in.tsx        # Login screen
│   │   └── sign-up.tsx        # Registration screen
│   │
│   ├── (tabs)/                # Tab-based layout
│   │   ├── _layout.tsx        # Tab navigation
│   │   ├── index.tsx          # Home tab
│   │   └── explore.tsx        # Explore tab
│   │
│   ├── (customer)/            # Customer-only routes
│   │   ├── _layout.tsx        # Customer layout
│   │   ├── home.tsx           # Customer home
│   │   ├── orders.tsx         # View orders
│   │   ├── active_tickets.tsx # Support tickets
│   │   ├── announcements.tsx  # Announcements
│   │   ├── profile.tsx        # Profile settings
│   │   └── custom.tsx         # Custom service request
│   │
│   ├── (employee)/            # Employee-only routes
│   │   ├── _layout.tsx        # Employee layout
│   │   ├── home.tsx           # Employee dashboard
│   │   ├── orders.tsx         # Assigned orders
│   │   ├── tickets.tsx        # Support tickets
│   │   ├── announcements.tsx  # System announcements
│   │   └── profile.tsx        # Employee profile
│   │
│   └── (admin)/               # Admin-only routes
│       ├── _layout.tsx        # Admin layout
│       ├── dashboard.tsx      # Admin dashboard
│       ├── orders.tsx         # All orders
│       ├── products.tsx       # Product management
│       ├── announcements.tsx  # Manage announcements
│       ├── employees.tsx      # Employee management
│       ├── tickets.tsx        # All tickets
│       └── profile.tsx        # Admin profile
│
├── components/                # Reusable UI components
│   ├── external-link.tsx
│   ├── haptic-tab.tsx
│   ├── hello-wave.tsx
│   ├── parallax-scroll-view.tsx
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/                    # Custom UI components
│       ├── collapsible.tsx
│       ├── icon-symbol.tsx
│       └── icon-symbol.ios.tsx
│
├── config/                    # Configuration files
│   └── api.ts                 # API base URL & endpoints
│
├── constants/                 # App constants
│   └── theme.ts               # Color schemes & themes
│
├── hooks/                     # Custom React hooks
│   ├── use-color-scheme.ts    # Color scheme detection
│   ├── use-color-scheme.web.ts
│   └── use-theme-color.ts     # Theme color management
│
├── lib/                       # Utility libraries
│   └── auth.ts                # Auth helpers & JWT management
│
├── utils/                     # Utility functions
│   └── notifications.ts       # Push notification handling
│
├── scripts/                   # Build scripts
│   └── reset-project.js       # Reset to blank template
│
├── assets/                    # Static assets
│   └── images/               # Image files
│
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── expo-env.d.ts             # Expo type definitions
├── eas.json                  # EAS Build configuration
├── app.json                  # Expo app configuration
├── eslint.config.js          # ESLint rules
└── README.md                 # This file
```

## 🏗️ App Architecture

### File-Based Routing (Expo Router)

The app uses **Expo Router** for file-based routing, similar to Next.js:

- `_layout.tsx` = Layout wrapper for nested routes
- `(groupName)/` = Route group (doesn't affect URL)
- `index.tsx` = Default route for directory
- Dynamic routes: `[id].tsx`

### Layout Structure

```
Root Layout (_layout.tsx)
├── Auth Screens (sign-in, sign-up)
├── Tabs Navigation (_layout.tsx)
├── Customer Section (requires customer role)
├── Employee Section (requires employee role)
└── Admin Section (requires admin role)
```

### Navigation Flow

1. **Unauthenticated** → Auth Stack (Sign In/Sign Up)
2. **Authenticated** → Role-based navigation
3. **Customer** → Customer tab stack
4. **Employee** → Employee tab stack
5. **Admin** → Admin dashboard

## 👥 User Roles

### Customer
- **Home**: View announcements & quick actions
- **Orders**: Create, view, and track orders
- **Active Tickets**: Submit and track support tickets
- **Custom**: Request custom services
- **Announcements**: View system announcements
- **Profile**: Manage account settings

### Employee
- **Home**: Dashboard with assigned work
- **Orders**: View & update assigned orders
- **Tickets**: Manage support tickets
- **Announcements**: View company announcements
- **Profile**: Update availability & info

### Admin
- **Dashboard**: System overview & analytics
- **Orders**: Manage all orders
- **Products**: Add/edit/delete products
- **Announcements**: Create system announcements
- **Employees**: Manage employee accounts
- **Tickets**: Monitor all support tickets
- **Profile**: Admin settings

## 📺 Key Screens

| Screen | Purpose | Roles |
|--------|---------|-------|
| Sign In | User authentication | All |
| Sign Up | New user registration | All |
| Customer Home | Orders & announcements | Customer |
| Orders | Order management | Customer/Employee/Admin |
| Active Tickets | Support ticket tracking | Customer |
| Admin Dashboard | System overview | Admin |
| Products | Product catalog | Admin |
| Announcements | News & updates | All |
| Employees | Staff management | Admin |
| Profile | Account settings | All |

## 📊 State Management

### AsyncStorage
- Persistent user data (tokens, preferences)
- Local cache for orders/tickets

### Context API
- Global auth state
- Theme/locale settings
- User information

### Component State
- Form inputs
- UI states (loading, error)
- Local lists & filters

## 🔌 API Integration

### Base Configuration

```typescript
// config/api.ts
const API_BASE_URL = 'http://localhost:8000';

export const apiCall = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('authToken');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });
  return response.json();
};
```

### Common Endpoints Used

```typescript
// Authentication
POST /auth/login
POST /auth/signup
POST /auth/refresh
POST /auth/logout

// Orders
GET /orders
GET /orders/customer/{id}
POST /orders
PUT /orders/{id}
PUT /orders/{id}/status

// Tickets
GET /tickets
POST /tickets
PUT /tickets/{id}/status

// Products
GET /products

// Announcements
GET /announcements

// WebSocket (Real-time updates)
ws://localhost:8000/ws/{userId}
```

## 💻 Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run on web browser
npm run lint       # Run ESLint
npm run reset-project  # Reset to blank template
```

### Hot Reload

Expo supports hot reload:
- **Save file** → Changes appear immediately
- **Shake device** → Access developer menu

### Debug Menu

Press `d` in terminal to access:
- JavaScript debugger
- Performance monitor
- Network inspector
- DevTools

### TypeScript Support

- Strict mode enabled
- Type checking on save
- Auto-completion in IDE

## 🐛 Troubleshooting

### App Not Starting
```bash
# Clear cache and node_modules
rm -rf node_modules
npm install
npm start -- --clear
```

### Cannot Connect to Backend
```bash
# Check backend URL in config/api.ts
# Ensure backend is running on correct port
# Check CORS settings in backend
```

### Authentication Issues
```bash
# Clear AsyncStorage cache
# Log out and sign in again
# Check JWT token expiration
```

### Build Errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Run ESLint
npm run lint

# Clear Expo cache
expo start --clear
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Router Guide](https://docs.expo.dev/routing/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation](https://reactnavigation.org/)

## 🚀 Production Build

### Build for iOS

```bash
eas build --platform ios
```

### Build for Android

```bash
eas build --platform android
```

### Submit to App Stores

```bash
# Requires EAS CLI setup
eas submit
```

See [eas.json](eas.json) for build configuration.

## 📝 License

This project is part of the ServeDesk office service management system.

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Expo SDK**: 54.x
