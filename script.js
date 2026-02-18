// NexLayer Lab - Pure JavaScript (No Framework)

// Mock Data
const catalogProducts = [
    {
        id: 1,
        name: "Custom Name Plates",
        category: "Name Plates",
        image: "https://images.unsplash.com/photo-1621261053344-51c53e2e78a1?w=500",
        startingPrice: 199,
        description: "Personalized name plates for homes and offices"
    },
    {
        id: 2,
        name: "Sign Boards",
        category: "Sign Boards",
        image: "https://images.unsplash.com/photo-1606146490395-d987a2b1d19e?w=500",
        startingPrice: 499,
        description: "Custom sign boards for businesses"
    },
    {
        id: 3,
        name: "Custom Keychains",
        category: "Keychains",
        image: "https://images.unsplash.com/photo-1563620118-e3c83e61f000?w=500",
        startingPrice: 49,
        description: "Personalized 3D printed keychains"
    },
    {
        id: 4,
        name: "Decorative Items",
        category: "Decorative",
        image: "https://images.unsplash.com/photo-1545558014-8692f1fb4c6f?w=500",
        startingPrice: 299,
        description: "Unique decorative pieces for your space"
    },
    {
        id: 5,
        name: "Custom Tags",
        category: "Tags",
        image: "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=500",
        startingPrice: 79,
        description: "Custom tags for products and gifts"
    },
    {
        id: 6,
        name: "Miniature Models",
        category: "Models",
        image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=500",
        startingPrice: 599,
        description: "Detailed miniature models"
    }
];

const projectSuggestions = {
    robotics: [
        "Line Following Robot with Arduino",
        "Obstacle Avoiding Robot using Ultrasonic Sensors",
        "Gesture Controlled Robot",
        "Voice Controlled Robot using Bluetooth",
        "Pick and Place Robotic Arm"
    ],
    iot: [
        "Smart Home Automation System",
        "IoT Based Weather Monitoring Station",
        "Smart Irrigation System",
        "IoT Based Health Monitoring System",
        "Smart Parking System using IoT"
    ],
    mechanical: [
        "Automatic Gear Shifting Mechanism",
        "Solar Powered Water Pump",
        "Hydraulic Lift System",
        "Automatic Braking System",
        "Wind Turbine Power Generator"
    ],
    "diploma final year": [
        "Multi-Purpose Agriculture Machine",
        "Automatic Sanitizer Dispenser",
        "Portable Water Purification System",
        "Solar Powered Mobile Charger",
        "Automatic Plant Watering System"
    ],
    electrical: [
        "Automatic Street Light Controller",
        "Smart Energy Meter",
        "RFID Based Attendance System",
        "Wireless Power Transfer System",
        "Solar Tracking System"
    ],
    "computer science": [
        "Face Recognition Attendance System",
        "Chatbot using Machine Learning",
        "Smart Traffic Management System",
        "E-commerce Website with Payment Gateway",
        "Student Management System"
    ]
};

const materials = [
    { value: "pla", label: "PLA", price: 0 },
    { value: "petg", label: "PETG", price: 50 },
    { value: "abs", label: "ABS", price: 75 },
    { value: "tpu", label: "TPU", price: 100 },
    { value: "nylon", label: "Nylon", price: 150 }
];

const sizes = [
    { value: "small", label: "Small (5x5 cm)", price: 0 },
    { value: "medium", label: "Medium (10x10 cm)", price: 100 },
    { value: "large", label: "Large (15x15 cm)", price: 200 },
    { value: "xlarge", label: "Extra Large (20x20 cm)", price: 300 }
];

// State
let uploadedFiles = [];
let currentProduct = null;

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function generateOrderId() {
    return `ORD${Date.now()}`;
}

function saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
}

function getOrders() {
    return JSON.parse(localStorage.getItem('orders') || '[]');
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
document.getElementById('mobileMenuToggle').addEventListener('click', () => {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('mobileNav').classList.remove('active');
    });
});

// Hero Image Scroll Animation
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroImage = document.getElementById('heroImage');
    
    if (heroImage) {
        const scale = Math.max(0.7, 1 - scrollY / 1000);
        const translateY = Math.min(scrollY / 2, 200);
        heroImage.style.transform = `scale(${scale}) translateY(${translateY}px)`;
    }
});

// Project Suggestion Toggle
document.getElementById('projectCardHeader').addEventListener('click', () => {
    const content = document.getElementById('projectContent');
    const chevron = document.getElementById('projectChevron');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.setAttribute('data-lucide', 'chevron-up');
    } else {
        content.style.display = 'none';
        chevron.setAttribute('data-lucide', 'chevron-down');
    }
    lucide.createIcons();
});

// Project Suggestion Logic
document.getElementById('suggestBtn').addEventListener('click', () => {
    const keyword = document.getElementById('projectKeyword').value.toLowerCase().trim();
    
    if (!keyword) {
        showToast('Please enter a keyword', 'error');
        return;
    }
    
    let suggestions = [];
    
    // Search through categories
    Object.keys(projectSuggestions).forEach(category => {
        if (category.includes(keyword) || keyword.includes(category)) {
            suggestions = [...suggestions, ...projectSuggestions[category]];
        }
    });
    
    // Default suggestions if no match
    if (suggestions.length === 0) {
        suggestions = [
            ...projectSuggestions.robotics.slice(0, 2),
            ...projectSuggestions.iot.slice(0, 2),
            ...projectSuggestions.mechanical.slice(0, 1)
        ];
    }
    
    // Display suggestions
    const container = document.getElementById('suggestionsContainer');
    const list = document.getElementById('suggestionsList');
    
    list.innerHTML = suggestions.slice(0, 5).map((suggestion, index) => `
        <div class="suggestion-item">
            <div class="suggestion-text">
                <span class="suggestion-number">${index + 1}.</span>
                ${suggestion}
            </div>
            <button class="btn-whatsapp" onclick="contactWhatsApp('${suggestion.replace(/'/g, "\\'")}')">
                <i data-lucide="message-circle"></i>
                Discuss on WhatsApp
            </button>
        </div>
    `).join('');
    
    container.style.display = 'block';
    lucide.createIcons();
});

function contactWhatsApp(project) {
    const message = encodeURIComponent(`Hi NexLayer Lab! I'm interested in the project: "${project}". Can you help me with 3D printing components?`);
    window.open(`https://wa.me/917078294661?text=${message}`, '_blank');
}

// Load Catalog
function loadCatalog() {
    const grid = document.getElementById('catalogGrid');
    grid.innerHTML = catalogProducts.map(product => `
        <div class="glass-card catalog-card" onclick="openCustomizeModal(${product.id})">
            <div class="catalog-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="catalog-overlay">
                    <button class="btn-primary">
                        <i data-lucide="edit-3"></i>
                        Customize
                    </button>
                </div>
            </div>
            <div class="catalog-info">
                <h3 class="catalog-title">${product.name}</h3>
                <p class="catalog-description">${product.description}</p>
                <p class="catalog-price">Starting at ₹${product.startingPrice}</p>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// Open Customize Modal
function openCustomizeModal(productId) {
    currentProduct = catalogProducts.find(p => p.id === productId);
    const modal = document.getElementById('customizeModal');
    document.getElementById('modalTitle').textContent = `Customize ${currentProduct.name}`;
    
    // Reset form
    document.getElementById('customText').value = '';
    document.getElementById('customSize').value = 'medium';
    document.getElementById('customColor').value = 'black';
    document.getElementById('customMaterial').value = 'pla';
    document.getElementById('customQuantity').value = 1;
    
    updatePreview();
    calculatePrice();
    
    modal.classList.add('active');
}

// Close Modal
document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('customizeModal').classList.remove('active');
});

// Close modal when clicking outside
document.getElementById('customizeModal').addEventListener('click', (e) => {
    if (e.target.id === 'customizeModal') {
        document.getElementById('customizeModal').classList.remove('active');
    }
});

// Update Preview
function updatePreview() {
    const text = document.getElementById('customText').value || 'Your text here';
    const size = document.getElementById('customSize').value;
    const color = document.getElementById('customColor').value;
    const material = document.getElementById('customMaterial').value;
    
    document.getElementById('previewText').textContent = text;
    document.getElementById('previewSize').textContent = `Size: ${sizes.find(s => s.value === size).label}`;
    document.getElementById('previewColor').textContent = `Color: ${color.charAt(0).toUpperCase() + color.slice(1)}`;
    document.getElementById('previewMaterial').textContent = `Material: ${materials.find(m => m.value === material).label}`;
}

// Calculate Price
function calculatePrice() {
    if (!currentProduct) return;
    
    const basePrice = currentProduct.startingPrice;
    const sizePrice = sizes.find(s => s.value === document.getElementById('customSize').value).price;
    const materialPrice = materials.find(m => m.value === document.getElementById('customMaterial').value).price;
    const quantity = parseInt(document.getElementById('customQuantity').value) || 1;
    
    const total = (basePrice + sizePrice + materialPrice) * quantity;
    document.getElementById('totalPrice').textContent = `₹${total}`;
}

// Listen to form changes
['customText', 'customSize', 'customColor', 'customMaterial', 'customQuantity'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        updatePreview();
        calculatePrice();
    });
});

// Place Order from Modal
document.getElementById('placeOrderBtn').addEventListener('click', () => {
    const text = document.getElementById('customText').value.trim();
    
    if (!text) {
        showToast('Please enter custom text', 'error');
        return;
    }
    
    const orderId = generateOrderId();
    const orderData = {
        orderId,
        product: currentProduct.name,
        customization: {
            text: text,
            size: document.getElementById('customSize').value,
            color: document.getElementById('customColor').value,
            material: document.getElementById('customMaterial').value,
            quantity: parseInt(document.getElementById('customQuantity').value)
        },
        totalPrice: parseInt(document.getElementById('totalPrice').textContent.replace('₹', '')),
        timestamp: new Date().toISOString(),
        status: 'Submitted'
    };
    
    saveOrder(orderData);
    showToast(`Order placed! Order ID: ${orderId}`);
    document.getElementById('customizeModal').classList.remove('active');
    loadDashboard();
});

// File Upload - Drag and Drop
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

uploadZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-active');
});

uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-active');
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-active');
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
});

function handleFiles(files) {
    const validFiles = files.filter(file => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        return ['.stl', '.obj', '.3mf', '.png', '.jpg', '.jpeg'].includes(ext);
    });
    
    uploadedFiles = [...uploadedFiles, ...validFiles];
    displayFiles();
    updateSubmitButton();
}

function displayFiles() {
    const container = document.getElementById('uploadedFiles');
    const list = document.getElementById('filesList');
    
    if (uploadedFiles.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    document.getElementById('fileCount').textContent = uploadedFiles.length;
    
    list.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-item">
            <i data-lucide="file-text" class="file-icon"></i>
            <div class="file-info">
                <p class="file-name">${file.name}</p>
                <p class="file-size">${(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <button class="remove-file-btn" onclick="removeFile(${index})">
                <i data-lucide="x"></i>
            </button>
        </div>
    `).join('');
    
    container.style.display = 'block';
    lucide.createIcons();
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayFiles();
    updateSubmitButton();
}

function updateSubmitButton() {
    const btn = document.getElementById('submitOrderBtn');
    btn.disabled = uploadedFiles.length === 0;
}

// Submit Custom Order
document.getElementById('submitOrderBtn').addEventListener('click', () => {
    if (uploadedFiles.length === 0) {
        showToast('Please upload at least one file', 'error');
        return;
    }
    
    const orderId = generateOrderId();
    const orderData = {
        orderId,
        files: uploadedFiles.map(f => f.name),
        material: document.getElementById('orderMaterial').value,
        color: document.getElementById('orderColor').value,
        quantity: parseInt(document.getElementById('orderQuantity').value),
        notes: document.getElementById('orderNotes').value,
        timestamp: new Date().toISOString(),
        status: 'Submitted'
    };
    
    saveOrder(orderData);
    showToast(`Order Submitted! Order ID: ${orderId}`);
    
    // Reset form
    uploadedFiles = [];
    displayFiles();
    document.getElementById('orderNotes').value = '';
    fileInput.value = '';
    
    loadDashboard();
});

// Load Dashboard
function loadDashboard() {
    const orders = getOrders();
    const container = document.getElementById('dashboardContent');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="glass-card empty-state">
                <i data-lucide="package" class="empty-icon"></i>
                <h3 class="empty-title">No Orders Yet</h3>
                <p class="empty-text">Start by uploading your design or exploring our catalog</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="orders-list">
                ${orders.reverse().map(order => `
                    <div class="glass-card order-card-item">
                        <div class="order-header">
                            <div class="order-id-section">
                                <i data-lucide="${getStatusIcon(order.status)}"></i>
                                <div>
                                    <p class="order-id">${order.orderId}</p>
                                    <p class="order-date">${new Date(order.timestamp).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}</p>
                                </div>
                            </div>
                            <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                        </div>
                        <div class="order-details">
                            ${order.product ? `
                                <div class="order-detail-item">
                                    <span class="detail-label">Product:</span>
                                    <span class="detail-value">${order.product}</span>
                                </div>
                            ` : ''}
                            ${order.files ? `
                                <div class="order-detail-item">
                                    <span class="detail-label">Files:</span>
                                    <span class="detail-value">${order.files.join(', ')}</span>
                                </div>
                            ` : ''}
                            ${order.customization ? `
                                <div class="order-detail-item">
                                    <span class="detail-label">Text:</span>
                                    <span class="detail-value">${order.customization.text}</span>
                                </div>
                                <div class="order-detail-item">
                                    <span class="detail-label">Material:</span>
                                    <span class="detail-value">${order.customization.material.toUpperCase()}</span>
                                </div>
                            ` : ''}
                            ${order.material ? `
                                <div class="order-detail-item">
                                    <span class="detail-label">Material:</span>
                                    <span class="detail-value">${order.material.toUpperCase()}</span>
                                </div>
                            ` : ''}
                            ${order.quantity ? `
                                <div class="order-detail-item">
                                    <span class="detail-label">Quantity:</span>
                                    <span class="detail-value">${order.quantity}</span>
                                </div>
                            ` : ''}
                            ${order.totalPrice ? `
                                <div class="order-detail-item">
                                    <span class="detail-label">Total:</span>
                                    <span class="detail-value price">₹${order.totalPrice}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    lucide.createIcons();
}

function getStatusIcon(status) {
    const icons = {
        'Submitted': 'clock',
        'Reviewing': 'package',
        'Printing': 'package',
        'Completed': 'check-circle',
        'Delivered': 'truck'
    };
    return icons[status] || 'clock';
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    loadCatalog();
    loadDashboard();
    lucide.createIcons();
});
