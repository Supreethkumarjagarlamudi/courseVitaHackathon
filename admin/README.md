# Admin Panel

A comprehensive admin panel for managing events and tracking attendance for the CourseVita Event Management Platform.

## Features

- **Dashboard**: Overview statistics and quick actions
- **Event Management**: Create, edit, publish, and cancel events
- **Attendee Management**: View attendees, check-ins, and RSVP approvals
- **QR Code System**: Generate and manage QR codes for event check-ins
- **Analytics**: Track event views, registrations, and attendance
- **Export Functionality**: Export attendee lists to CSV

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Backend Integration**: RESTful API calls to the main backend
- **Authentication**: Simple environment-based admin credentials

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- The main backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example file
cp env.example .env

# Edit .env with your preferred credentials
VITE_BACKEND_URL=http://localhost:3000
VITE_ADMIN_EMAIL=admin@coursevita.com
VITE_ADMIN_PASSWORD=admin123456
```

3. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173` (or the port Vite assigns).

### Building for Production

```bash
npm run build
```

## Authentication

### Simple Admin Login

The admin panel uses a simple authentication system based on environment variables:

1. **Set credentials** in your `.env` file:
   ```env
   VITE_ADMIN_EMAIL=your-admin-email@example.com
   VITE_ADMIN_PASSWORD=your-secure-password
   ```

2. **Login** with these credentials at the admin panel

3. **Default credentials** (if no .env file):
   - Email: `admin@coursevita.com`
   - Password: `admin123456`

### Security Notes

⚠️ **For Development Only**: This simple authentication is suitable for development. For production:

- Use proper authentication with your backend
- Implement session management
- Add rate limiting
- Use HTTPS
- Consider two-factor authentication

## Usage

### Managing Events

1. **Create Events**: Use the "Create Event" page to add new events
2. **View Events**: See all events in the "Events" page with filtering options
3. **Edit Events**: Click the edit icon on any event to modify details
4. **Publish Events**: Change event status from draft to published
5. **Cancel Events**: Cancel upcoming events if needed

### Managing Attendees

1. **View Attendees**: Select an event to see all registered attendees
2. **Check-ins**: Mark attendees as checked in for events
3. **RSVP Management**: Approve or reject pending RSVPs
4. **Export Data**: Download attendee lists as CSV files
5. **QR Codes**: View and manage QR codes for each attendee

### Dashboard Features

- **Statistics Cards**: Total events, active events, attendees, upcoming events
- **Recent Events**: Quick access to recently created events
- **Quick Actions**: Direct links to create events, manage events, and view attendees

## API Integration

The admin panel integrates with the main backend API endpoints:

- `GET /api/my-events` - Get admin's events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/publish` - Publish event
- `POST /api/events/:id/cancel` - Cancel event
- `GET /api/events/:id/attendees` - Get event attendees
- `POST /api/rsvp/:id/checkin` - Check in attendee
- `POST /api/rsvp/:id/approve` - Approve/reject RSVP

## File Structure

```
src/
├── components/
│   └── Sidebar.jsx          # Navigation sidebar
├── pages/
│   ├── Dashboard.jsx        # Main dashboard
│   ├── Events.jsx          # Event management
│   ├── CreateEvent.jsx     # Event creation form
│   ├── EventDetails.jsx    # Event details view
│   ├── Attendees.jsx       # Attendee management
│   └── Login.jsx           # Admin login
├── App.jsx                 # Main app component
└── main.jsx               # App entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_ADMIN_EMAIL` | Admin email for login | `admin@coursevita.com` |
| `VITE_ADMIN_PASSWORD` | Admin password for login | `admin123456` |

## Development

### Adding New Features

1. Create new components in the `src/components/` directory
2. Add new pages in the `src/pages/` directory
3. Update the sidebar navigation in `Sidebar.jsx`
4. Add new routes in `App.jsx`

### Styling

The admin panel uses Tailwind CSS for styling. All components follow a consistent design system with:
- Clean, modern interface
- Responsive design
- Consistent color scheme
- Accessible components

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check your `.env` file credentials
2. **API Errors**: Check that the backend server is running
3. **CORS Issues**: Verify the backend CORS configuration includes the admin panel URL

### Debug Mode

Enable debug logging by adding to the browser console:
```javascript
localStorage.setItem('debug', 'admin:*')
```

## Contributing

1. Follow the existing code structure and patterns
2. Use Tailwind CSS for styling
3. Include proper error handling
4. Add loading states for async operations
5. Test all functionality before submitting changes
