# NexLayer Lab - Pure HTML/CSS/JS Website

## 🚀 About
A premium, futuristic 3D printing service website built with **pure HTML, CSS, and JavaScript** - no frameworks, no dependencies, no build process!

## ✨ Features

### Interactive & Animated
- **Scroll-based hero image transformation** - Image scales and moves as you scroll
- **Glassmorphism UI** - Modern frosted glass effect on cards
- **Smooth animations** - Parallax effects, hover states, and transitions
- **Dark theme** - Pure black (#000000) with neon cyan (#00FFD1) accents

### Core Functionality
1. **Hero Section** - Full-screen with scroll animations
2. **College Project Assistant** - Smart keyword-based project suggestions
3. **Product Catalog** - 6 product categories with customization
4. **Custom Order Form** - Drag & drop file upload (STL, OBJ, 3MF)
5. **Order Dashboard** - Track orders with status (Submitted → Reviewing → Printing → Completed)
6. **WhatsApp Integration** - Direct messaging for inquiries
7. **Mobile Responsive** - Fully optimized for all devices

## 📁 File Structure
```
vanilla/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling (dark theme + glassmorphism)
├── script.js       # All JavaScript functionality
└── README.md       # This file
```

## 🎯 How to Use

### Option 1: Direct File Access
1. Download all 3 files (index.html, styles.css, script.js)
2. Keep them in the same folder
3. Double-click `index.html` to open in browser
4. That's it! No server needed.

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

### Option 3: Deploy to Web
Upload all files to:
- **Netlify** - Drag & drop the folder
- **Vercel** - Deploy with a single command
- **GitHub Pages** - Push to repository
- **Any hosting** - Just upload the 3 files

## 🎨 Design System

### Colors
- **Background**: Pure Black (#000000)
- **Brand/Accent**: Neon Cyan (#00FFD1)
- **Text**: White (#FFFFFF) with opacity variations
- **Cards**: Dark gray with glassmorphism

### Typography
- **Font**: Inter (loaded from Google Fonts)
- **Heading**: 48-66px
- **Body**: 16-20px
- **Sharp corners** on buttons (0px border-radius)

### Effects
- Backdrop blur: 20px
- Box shadows with cyan glow
- Smooth transitions: 0.3-0.4s
- Hover lift effect: translateY(-4px)

## 🛠️ Technologies

### Zero Dependencies
- **Pure HTML5** - Semantic markup
- **Pure CSS3** - Modern features (backdrop-filter, grid, flexbox)
- **Vanilla JavaScript (ES6+)** - No jQuery, no libraries
- **Lucide Icons** - Only external CDN (optional, can be replaced)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📦 Local Storage
Orders are saved in browser's localStorage:
```javascript
localStorage.getItem('orders')  // Get all orders
localStorage.setItem('orders', JSON.stringify(data))  // Save orders
```

## 🔧 Customization

### Change Colors
Edit `styles.css`:
```css
:root {
    --brand-primary: #00FFD1;  /* Change this to your brand color */
    --bg-primary: #000000;     /* Background color */
}
```

### Add Products
Edit `script.js`:
```javascript
const catalogProducts = [
    {
        id: 7,
        name: "Your Product",
        image: "your-image-url.jpg",
        startingPrice: 299,
        description: "Your description"
    }
];
```

### Change Contact Info
Edit `index.html`:
- WhatsApp: Search for `917078294661` and replace
- Email: Search for `contact@nexlayerlab.in` and replace

## 🎯 Key Features Breakdown

### 1. Hero Scroll Animation
```javascript
window.addEventListener('scroll', () => {
    const scale = Math.max(0.7, 1 - scrollY / 1000);
    const translateY = Math.min(scrollY / 2, 200);
    heroImage.style.transform = `scale(${scale}) translateY(${translateY}px)`;
});
```

### 2. Project Suggestions
- Keyword-based matching
- 6 categories: Robotics, IoT, Mechanical, Electrical, CS, Diploma
- WhatsApp integration for each suggestion

### 3. File Upload
- Drag & drop support
- File type validation (STL, OBJ, 3MF, PNG, JPG)
- File size display
- Remove uploaded files

### 4. Order Management
- Generate unique Order IDs
- Save to localStorage
- Display with status badges
- Categorized by order type (catalog/custom)

## 🚀 Performance
- **Load Time**: < 1 second (no framework overhead)
- **File Size**: 
  - HTML: ~15 KB
  - CSS: ~25 KB
  - JS: ~20 KB
  - **Total: ~60 KB** (excluding images)
- **No Build Process**: Edit and refresh
- **SEO Friendly**: Pure HTML with semantic markup

## 📱 Mobile Responsive
Breakpoints:
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## 🎨 Animation List
1. Hero image scale & parallax
2. Card hover lift
3. Button hover glow
4. Modal slide in
5. Toast notification slide
6. Scroll indicator pulse
7. Navbar blur on scroll
8. Glassmorphism backdrop

## 🔒 Security Notes
- No backend = No server vulnerabilities
- Client-side only = No data breaches
- localStorage = User's own browser storage
- WhatsApp integration = Direct to official API

## 📧 Contact Integration
- **WhatsApp**: Prefilled messages for each action
- **Email**: contact@nexlayerlab.in
- **Location**: Haridwar, India
- **Phone**: +91 7078294661

## 🎓 Use Cases
Perfect for:
- 3D printing services
- Portfolio websites
- Service landing pages
- Local businesses
- Quick prototypes
- Learning HTML/CSS/JS

## 🌟 Advantages Over React Version
1. **Faster Load**: No framework parsing
2. **Simpler Deployment**: Just 3 files
3. **Better SEO**: Direct HTML
4. **Easier to Edit**: No build process
5. **Smaller Size**: 60KB vs 2MB+
6. **Universal**: Works anywhere
7. **Learning**: Pure fundamentals

## 📝 License
Free to use and modify for your projects!

## 🤝 Credits
- Design: Custom dark theme with glassmorphism
- Icons: Lucide Icons (https://lucide.dev)
- Images: Unsplash (demo purposes)

---

**Built with ❤️ for NexLayer Lab**
