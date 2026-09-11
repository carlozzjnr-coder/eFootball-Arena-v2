# eFootball Arena Frontend

## Development

```bash
cd frontend
npm install
npm run dev
```

Access: http://localhost:3000

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── slices/         # Redux slices
├── styles/         # Global styles
├── utils/          # Helper functions
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── store.js        # Redux store
```

## Features

- Authentication (Login/Register)
- Tournament browsing and management
- Real-time rankings
- Player profiles
- Admin dashboard
- Responsive design
- Dark theme

## Technologies

- React 18
- Redux Toolkit
- Tailwind CSS
- Vite
- Socket.io Client
- React Router

## Environment Variables

Create `.env` file:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

## API Integration

All API calls go through axios with centralized error handling in Redux slices.

## Styling

Tailwind CSS with custom configuration for dark theme.
