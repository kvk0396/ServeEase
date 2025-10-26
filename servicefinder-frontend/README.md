# ServiceFinder Frontend

A modern, responsive web application for connecting customers with local service providers. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Customer Features
- **Service Discovery**: Browse and search services with advanced filtering
- **Service Details**: View detailed service information, provider profiles, and reviews
- **Booking System**: Multi-step booking process with date/time selection
- **Booking Management**: View, modify, and cancel bookings
- **Rating System**: Rate and review completed services
- **Location Search**: GPS-based service provider discovery
- **Dashboard**: Personal dashboard with booking history and quick actions

### Provider Features
- **Business Dashboard**: Comprehensive overview with metrics and analytics
- **Service Management**: Create, edit, and manage service offerings
- **Booking Management**: Handle customer requests and update booking status
- **Business Profile**: Manage business information and verification status
- **Business Hours**: Set availability and working hours
- **Customer Communication**: View customer details and booking information

### General Features
- **Authentication**: Secure JWT-based login and registration
- **Role-based Access**: Separate interfaces for customers and providers
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Live data synchronization with the backend
- **Modern UI**: Clean, professional interface with smooth animations

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: 
  - Zustand (global state)
  - TanStack Query (server state)
- **Routing**: React Router DOM with protected routes
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- ServiceFinder Backend API running

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd servicefinder-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_APP_NAME=ServiceFinder
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation header
│   ├── Footer.tsx       # Application footer
│   ├── Layout.tsx       # Page layout wrapper
│   └── ProtectedRoute.tsx # Route protection
├── pages/               # Route-specific pages
│   ├── auth/           # Authentication pages
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── customer/       # Customer-specific pages
│   │   ├── CustomerDashboard.tsx
│   │   ├── CustomerBookings.tsx
│   │   ├── CustomerRatings.tsx
│   │   └── BookingPage.tsx
│   ├── provider/       # Provider-specific pages
│   │   ├── ProviderDashboard.tsx
│   │   ├── ManageServices.tsx
│   │   ├── ProviderBookings.tsx
│   │   └── ProviderProfile.tsx
│   ├── HomePage.tsx    # Landing page
│   ├── ServicesPage.tsx # Service browsing
│   ├── ServiceDetailPage.tsx # Service details
│   ├── SearchPage.tsx  # Location-based search
│   └── NotFoundPage.tsx # 404 page
├── lib/                # Utilities and configurations
│   ├── api.ts          # API client and endpoints
│   └── utils.ts        # Helper functions
├── store/              # Global state management
│   └── authStore.ts    # Authentication state
├── types/              # TypeScript type definitions
│   └── index.ts        # Application types
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## 🎨 Design System

The application uses a custom design system built on Tailwind CSS:

### Colors
- **Primary**: Blue-based palette for main actions
- **Secondary**: Gray-based palette for neutral elements
- **Success**: Green for positive actions
- **Warning**: Yellow for warnings
- **Error**: Red for errors and destructive actions

### Components
- **Buttons**: Multiple variants (primary, outline, danger, success)
- **Cards**: Consistent card layouts with shadows
- **Forms**: Styled inputs, selects, and textareas
- **Badges**: Status indicators and labels
- **Loading**: Spinners and skeleton screens

## 🔒 Authentication

The application uses JWT-based authentication:

1. **Registration**: Users can register as customers or service providers
2. **Login**: Secure login with email and password
3. **Token Management**: Automatic token refresh and storage
4. **Protected Routes**: Role-based route protection
5. **Logout**: Secure token cleanup

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

Key responsive features:
- Mobile-first CSS approach
- Collapsible navigation menu
- Responsive grid layouts
- Touch-friendly interface elements

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🔧 Configuration

### API Integration
The application connects to the ServiceFinder backend API. Configure the API base URL in the `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Build Configuration
The build is configured in `vite.config.ts` with:
- TypeScript support
- React plugin
- Path aliases
- Environment variable handling

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: AWS CloudFront, Cloudflare
- **Server**: Nginx, Apache

## 🔄 API Integration

The application integrates with the ServiceFinder backend API through a centralized API client (`src/lib/api.ts`):

### Key Endpoints
- **Authentication**: `/auth/login`, `/auth/register`
- **Services**: `/services/*` - CRUD operations
- **Bookings**: `/bookings/*` - Booking management
- **Ratings**: `/ratings/*` - Review system
- **Search**: `/search/*` - Location-based search

### Error Handling
- Automatic token refresh
- Global error interceptors
- User-friendly error messages
- Retry mechanisms for failed requests

## 🎯 User Flows

### Customer Journey
1. **Discovery**: Browse or search for services
2. **Selection**: View service details and provider info
3. **Booking**: Select date/time and provide details
4. **Management**: Track booking status and communicate
5. **Review**: Rate and review completed services

### Provider Journey
1. **Setup**: Create business profile and verify account
2. **Services**: Add and manage service offerings
3. **Bookings**: Receive and manage customer requests
4. **Fulfillment**: Update booking status and communicate
5. **Growth**: Monitor performance and customer feedback

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Route Protection**: Role-based access control
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs
- **HTTPS**: Secure data transmission (in production)

## 🎨 UI/UX Features

- **Loading States**: Smooth loading indicators
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: User feedback for actions
- **Modal Dialogs**: Interactive popups and confirmations
- **Form Validation**: Real-time form validation
- **Accessibility**: Keyboard navigation and screen reader support

## 🔍 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**ServiceFinder Frontend** - Connecting customers with local service providers through modern web technology.
