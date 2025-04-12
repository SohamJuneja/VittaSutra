# Government Expenditure Tracker - Frontend

The frontend application for the Government Expenditure Tracking System.

## Quick Start

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Access the application at http://localhost:5173 (or the port shown in the console)

## Feature Overview

The frontend provides interfaces for:

- User authentication (citizen and government official views)
- Project viewing and management
- Expenditure tracking with blockchain verification
- Complaint submission and resolution system
- Dark mode support for better accessibility

## File Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API service integrations
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   ├── index.css       # Global styles
│   └── main.tsx        # Application entry point
└── package.json        # Dependencies and scripts
```

## NPM Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run the linter

## Technologies Used

- React with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Lucide for icons
- React Router for navigation 