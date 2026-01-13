# PMI Horse Heart Rate Monitor Platform

A complete front-end application for monitoring horse heart rates and performance metrics. Built with React, Tailwind CSS, and modern web technologies.

## Features

- 🐴 **Horse Management**: Track multiple horses with detailed profiles
- 📊 **Real-time Monitoring**: Live dashboard with heart rate, speed, and distance tracking
- 📈 **Advanced Analytics**: Charts and graphs for performance analysis
- 🗺️ **Route Mapping**: Visualize training routes with Leaflet maps
- 📅 **Training Schedule**: Manage and edit training schedules
- 👥 **Multi-user Support**: Role-based access (Horse Owner, Stable Manager, Stable Owner, Admin)
- 🌍 **Multi-language**: Support for English, Arabic (RTL), and French
- 💳 **Subscription Plans**: Free, Pro, and Enterprise tiers with feature restrictions

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Recharts** - Chart library
- **React Leaflet** - Map integration
- **i18next** - Internationalization

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable components
├── context/          # React context providers
├── data/             # Mock data
├── i18n/             # Internationalization config
│   └── locales/      # Translation files
├── layouts/          # Layout components
├── pages/            # Page components
└── main.jsx          # Entry point
```

## Pages

### Public Pages
- **Landing Page** (`/`) - Homepage with features overview
- **Pricing** (`/pricing`) - Subscription plans
- **Login** (`/login`) - User authentication UI
- **Register** (`/register`) - User registration with image uploads

### Dashboard Pages
- **Live Dashboard** (`/dashboard`) - Real-time monitoring with charts and maps
- **Horse Profile** (`/dashboard/horses/:id`) - Individual horse details
- **Rider Profile** (`/dashboard/riders/:id`) - Rider information
- **Trainer Profile** (`/dashboard/trainers/:id`) - Trainer details
- **Training Schedule** (`/dashboard/schedule`) - Editable training schedule
- **Admin Panel** (`/dashboard/admin`) - Admin-only management interface

## User Roles

- **Horse Owner**: 1 horse, basic features
- **Stable Manager**: 10 horses, advanced features
- **Stable Owner**: 50+ horses, all features
- **Admin**: Full system access

## Subscription Plans

- **Free**: Basic monitoring, limited features
- **Pro**: Advanced analytics, training schedule
- **Enterprise**: All features, admin panel access

## Mock Data

All data is mocked and stored in `src/data/mockData.js`. The application is ready to connect to a backend API by replacing mock data calls with actual API requests.

## Internationalization

The app supports three languages:
- English (en)
- Arabic (ar) - with RTL support
- French (fr)

Language can be switched using the language switcher component in the top navigation.

## Notes

- This is a **front-end only** application with no backend or API calls
- All authentication is mocked
- Data persists only during the session
- Ready for backend integration

## License

MIT
