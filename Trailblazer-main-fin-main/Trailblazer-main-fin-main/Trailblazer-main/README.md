# Trailblazer - Printing and Layout Services

A responsive web application for Trailblazer Printing and Layout Services that allows users to upload files, manage their basket, enter delivery information, and complete payment.

## Getting Started

Follow these steps to set up and run the Trailblazer application locally:

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/trailblazer.git
   cd trailblazer-main
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Project Structure

```
trailblazer-main/
├── public/
├── src/
│   ├── assets/
│   │   ├── Basket/
│   │   ├── DeliveryAddress/
│   │   ├── OrderConfirmed/
│   │   ├── Payment/
│   │   └── pages/
│   ├── components/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

## Features

### 1. File Upload

- Upload files for printing and layout services
- Select file types and quantities

### 2. Basket Management

- View uploaded files in the basket
- Remove items from the basket
- See total price calculation

### 3. Delivery Information

- Enter account details (name, phone number)
- Specify delivery address (building, room)
- Set delivery time preferences

### 4. Payment

- Select payment method
- Review order details
- Accept terms and conditions

### 5. Order Confirmation

- View order confirmation with a checkmark
- Navigate back to dashboard

## Responsive Design

The application is fully responsive and adapts to different screen sizes:

- **Desktop**: Full layout with optimal spacing
- **Tablet**: Adjusted layout with proper element sizing
- **Mobile**: Stacked elements with appropriate font sizes and touch targets

## Development Guidelines

### Adding New Components

1. Create a new folder in `src/assets/` with your component name
2. Add both JSX and CSS files (ComponentName.jsx and ComponentName.css)
3. Follow existing naming conventions (e.g., "da-" prefix for DeliveryAddress)
4. Import the component in the appropriate parent component

### Styling Guidelines

- Use responsive units (%, clamp(), vw, vh) instead of fixed pixel values
- Implement media queries for different screen sizes
- Use flexbox for layouts to ensure proper alignment
- Follow the existing color scheme

## Browser Compatibility

The application is tested and works on:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

[Your License Information]
