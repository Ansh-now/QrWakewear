// ===============================================
// script.js - NexLayer Lab (Full Working Version)
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBqXMwAZSsKi8_LGWmnPF36Z1jyZzDVPCM",
    authDomain: "nexlayerlab.firebaseapp.com",
    projectId: "nexlayerlab",
    storageBucket: "nexlayerlab.appspot.com",
    messagingSenderId: "52859959386",
    appId: "1:52859959386:web:c863a84e27e45a825e4063"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ====================== STATE ======================
let uploadedFiles = [];
let currentProduct = null;
let currentUser = null;
let isAdmin = false;

const ADMIN_EMAIL = "anshyadav0135@gmail.com";   // ← Change this to your real admin email

const catalogProducts = [
    { id: 1, name: "Custom Name Plates", image: "https://images.unsplash.com/photo-1621261053344-51c53e2e78a1?w=500", startingPrice: 199, description: "Personalized name plates" },
    { id: 2, name: "Sign Boards", image: "https://images.unsplash.com/photo-1606146490395-d987a2b1d19e?w=500", startingPrice: 499, description: "Custom sign boards" },
    { id: 3, name: "Custom Keychains", image: "https://images.unsplash.com/photo-1563620118-e3c83e61f000?w=500", startingPrice: 49, description: "Personalized keychains" },
    { id: 4, name: "Decorative Items", image: "https://images.unsplash.com/photo-1545558014-8692f1fb4c6f?w=500", startingPrice: 299, description: "Unique decorative pieces" }
];

const materials = [
    { value: "pla", label: "PLA", price: 0 },
    { value: "petg", label: "PETG", price: 50 },
    { value: "abs", label: "ABS", price: 75 },
    { value: "tpu", label: "TPU", price: 100 }
];

const sizes = [
    { value: "small", label: "Small (5x5 cm)", price: 0 },
    { value: "medium", label: "Medium (10x10 cm)", price: 100 },
    { value: "large", label: "Large (15x15 cm)", price: 200 },
    { value: "xlarge", label: "Extra Large (20x20 cm)", price: 300 }
];

// ====================== UTILITY ======================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ====================== AUTH ======================
onAuthStateChanged(auth, user => {
    currentUser = user;
    isAdmin = user && user.email === ADMIN_EMAIL;

    document.getElementById('loginBtn').style.display = user ? 'none' : 'inline-flex';
    document.getElementById('logoutBtn').style.display = user ? 'inline-flex' : 'none';
    document.getElementById('userGreeting').style.display = user ? 'inline' : 'none';

    if (user) {
        document.getElementById('userEmail').textContent = user.email.split('@')[0];
    }
    loadDashboard();
});

document.getElementById('loginBtn').addEventListener('click', () => {
    document.getElementById('authModal').classList.add('active');
});

document.getElementById('authClose').addEventListener('click', () => {
    document.getElementById('authModal').classList.remove('active');
});

document.getElementById('toggleAuth').addEventListener('click', () => {
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authBtn');
    if (title.textContent === 'Login') {
        title.textContent = 'Sign Up';
        btn.textContent = 'Sign Up';
    } else {
        title.textContent = 'Login';
        btn.textContent = 'Login';
    }
});

document.getElementById('authBtn').addEventListener('click', async () => {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const isSignup = document.getElementById('authBtn').textContent === 'Sign Up';

    try {
        if (isSignup) {
            await createUserWithEmailAndPassword(auth, email, password);
            showToast('Account created successfully!');
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            showToast('Logged in successfully!');
        }
        document.getElementById('authModal').classList.remove('active');
    } catch (error) {
        showToast(error.message, 'error');
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth);
});

// ====================== 3D PREVIEW (Fixed) ======================
function loadPreview(index, file) {
    const container = document.getElementById(`preview-${index}`);
    if (!container) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['stl', 'obj'].includes(ext)) return;

    container.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / 220, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, 220);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const reader = new FileReader();
    reader.onload = (e) => {
        let loader = ext === 'stl' ? new STLLoader() : new OBJLoader();
        let object = loader.parse(e.target.result);

        if (object.isBufferGeometry) {
            object = new THREE.Mesh(object, new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 30 }));
        }

        scene.add(object);

        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()).length();

        object.position.sub(center);
        camera.position.set(0, size * 0.4, size * 1.8);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    };
    reader.readAsArrayBuffer(file);
}

// ====================== FILE UPLOAD ======================
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-active'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-active'));
uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-active');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', e => handleFiles(e.target.files));

function handleFiles(files) {
    if (!currentUser) {
        showToast('Please login first', 'error');
        document.getElementById('authModal').classList.add('active');
        return;
    }

    const validFiles = Array.from(files).filter(file => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        return ['.stl','.obj','.3mf','.png','.jpg','.jpeg'].includes(ext);
    });

    uploadedFiles = [...uploadedFiles, ...validFiles];
    displayFiles();
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
            <div class="file-preview" id="preview-${index}"></div>
        </div>
    `).join('');

    container.style.display = 'block';
    lucide.createIcons();

    uploadedFiles.forEach((file, index) => loadPreview(index, file));
}

window.removeFile = (index) => {
    uploadedFiles.splice(index, 1);
    displayFiles();
};

function updateSubmitButton() {
    document.getElementById('submitOrderBtn').disabled = uploadedFiles.length === 0;
}

// ====================== CATALOG ======================
function loadCatalog() {
    const grid = document.getElementById('catalogGrid');
    grid.innerHTML = catalogProducts.map(product => `
        <div class="glass-card catalog-card" onclick="openCustomizeModal(${product.id})">
            <div class="catalog-image">
                <img src="\( {product.image}" alt=" \){product.name}">
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

window.openCustomizeModal = (productId) => {
    if (!currentUser) {
        showToast('Please login to customize', 'error');
        document.getElementById('authModal').classList.add('active');
        return;
    }
    currentProduct = catalogProducts.find(p => p.id === productId);
    document.getElementById('modalTitle').textContent = `Customize ${currentProduct.name}`;
    document.getElementById('customizeModal').classList.add('active');
};

// ====================== CUSTOMIZE MODAL ======================
['customText', 'customSize', 'customColor', 'customMaterial', 'customQuantity'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
        updatePreview();
        calculatePrice();
    });
});

function updatePreview() {
    const text = document.getElementById('customText').value || 'Your text here';
    document.getElementById('previewText').textContent = text;
}

function calculatePrice() {
    if (!currentProduct) return;
    const base = currentProduct.startingPrice;
    const sizePrice = sizes.find(s => s.value === document.getElementById('customSize').value)?.price || 0;
    const matPrice = materials.find(m => m.value === document.getElementById('customMaterial').value)?.price || 0;
    const qty = parseInt(document.getElementById('customQuantity').value) || 1;
    document.getElementById('totalPrice').textContent = `₹${(base + sizePrice + matPrice) * qty}`;
}

document.getElementById('placeOrderBtn').addEventListener('click', async () => {
    if (!document.getElementById('customText').value.trim()) {
        showToast('Please enter custom text', 'error');
        return;
    }

    const orderData = {
        userId: currentUser.uid,
        product: currentProduct.name,
        customization: {
            text: document.getElementById('customText').value,
            size: document.getElementById('customSize').value,
            color: document.getElementById('customColor').value,
            material: document.getElementById('customMaterial').value,
            quantity: parseInt(document.getElementById('customQuantity').value)
        },
        totalPrice: parseInt(document.getElementById('totalPrice').textContent.replace('₹','')),
        status: 'Submitted',
        timestamp: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, 'orders'), orderData);
        showToast('Order placed successfully!');
        document.getElementById('customizeModal').classList.remove('active');
        loadDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// ====================== SUBMIT CUSTOM ORDER ======================
document.getElementById('submitOrderBtn').addEventListener('click', async () => {
    if (uploadedFiles.length === 0) {
        showToast('Please upload at least one file', 'error');
        return;
    }

    const orderData = {
        userId: currentUser.uid,
        material: document.getElementById('orderMaterial').value,
        color: document.getElementById('orderColor').value,
        quantity: parseInt(document.getElementById('orderQuantity').value),
        notes: document.getElementById('orderNotes').value,
        status: 'Submitted',
        timestamp: new Date().toISOString(),
        files: []
    };

    try {
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        const orderId = docRef.id;

        const urls = await Promise.all(uploadedFiles.map(async file => {
            const storageRef = ref(storage, `orders/\( {orderId}/ \){file.name}`);
            await uploadBytes(storageRef, file);
            return getDownloadURL(storageRef);
        }));

        await updateDoc(doc(db, 'orders', orderId), { files: urls });

        showToast(`Order Submitted! ID: ${orderId}`);
        uploadedFiles = [];
        displayFiles();
        document.getElementById('orderNotes').value = '';
        loadDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// ====================== DASHBOARD ======================
async function loadDashboard() {
    const container = document.getElementById('dashboardContent');
    if (!currentUser) {
        container.innerHTML = `
            <div class="glass-card empty-state">
                <i data-lucide="package" class="empty-icon"></i>
                <h3 class="empty-title">Please Login</h3>
                <button class="btn-primary" onclick="document.getElementById('authModal').classList.add('active')">Login Now</button>
            </div>`;
        lucide.createIcons();
        return;
    }

    const q = isAdmin 
        ? query(collection(db, 'orders')) 
        : query(collection(db, 'orders'), where('userId', '==', currentUser.uid));

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (orders.length === 0) {
        container.innerHTML = `<div class="glass-card empty-state"><h3>No Orders Yet</h3></div>`;
        return;
    }

    container.innerHTML = `
        <div class="orders-list">
            ${orders.map(order => `
                <div class="glass-card order-card-item">
                    <div class="order-header">
                        <div class="order-id-section">
                            <i data-lucide="${getStatusIcon(order.status)}"></i>
                            <div>
                                <p class="order-id">${order.id}</p>
                                <p class="order-date">${new Date(order.timestamp).toLocaleDateString('en-IN')}</p>
                            </div>
                        </div>
                        <span class="status-badge status-\( {order.status.toLowerCase()}"> \){order.status}</span>
                    </div>
                    ${isAdmin ? `
                        <select id="status-${order.id}" class="dark-select">
                            <option value="Submitted" ${order.status==='Submitted'?'selected':''}>Submitted</option>
                            <option value="Reviewing" ${order.status==='Reviewing'?'selected':''}>Reviewing</option>
                            <option value="Printing" ${order.status==='Printing'?'selected':''}>Printing</option>
                            <option value="Completed" ${order.status==='Completed'?'selected':''}>Completed</option>
                        </select>
                        <button onclick="updateOrderStatus('${order.id}')" class="btn-primary" style="margin-left:10px;">Update Status</button>
                    ` : ''}
                </div>
            `).join('')}
        </div>`;
    lucide.createIcons();
}

window.updateOrderStatus = async (orderId) => {
    const newStatus = document.getElementById(`status-${orderId}`).value;
    await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    showToast('Status updated!');
    loadDashboard();
};

function getStatusIcon(status) {
    const icons = { Submitted: 'clock', Reviewing: 'package', Printing: 'package', Completed: 'check-circle' };
    return icons[status] || 'clock';
}

// ====================== PROJECT SUGGESTION (AI) ======================
document.getElementById('suggestBtn').addEventListener('click', async () => {
    const keyword = document.getElementById('projectKeyword').value.trim();
    if (!keyword) return showToast('Enter a keyword', 'error');

    try {
        const res = await fetch(`https://text.pollinations.ai/Generate 5 college project ideas for 3D printing related to ${keyword}`);
        const text = await res.text();
        const suggestions = text.split('\n').filter(line => line.trim()).slice(0, 5);

        document.getElementById('suggestionsList').innerHTML = suggestions.map((s, i) => `
            <div class="suggestion-item">
                <div class="suggestion-text">
                    <span class="suggestion-number">${i+1}.</span> ${s}
                </div>
                <button class="btn-whatsapp" onclick="contactWhatsApp('${s.replace(/'/g, "\\'")}')">
                    Discuss on WhatsApp
                </button>
            </div>
        `).join('');

        document.getElementById('suggestionsContainer').style.display = 'block';
        lucide.createIcons();
    } catch (e) {
        showToast('Failed to get suggestions', 'error');
    }
});

window.contactWhatsApp = (project) => {
    const msg = encodeURIComponent(`Hi NexLayer Lab! I like this project: "${project}". Can you help with 3D printing?`);
    window.open(`https://wa.me/917078294661?text=${msg}`, '_blank');
};

// ====================== INIT ======================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadCatalog();
    loadDashboard();

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
    });

    // Mobile menu
    document.getElementById('mobileMenuToggle').addEventListener('click', () => {
        document.getElementById('mobileNav').classList.toggle('active');
    });

    // Project toggle
    document.getElementById('projectCardHeader').addEventListener('click', () => {
        const content = document.getElementById('projectContent');
        const chevron = document.getElementById('projectChevron');
        const isHidden = content.style.display === 'none' || !content.style.display;
        content.style.display = isHidden ? 'block' : 'none';
        chevron.setAttribute('data-lucide', isHidden ? 'chevron-up' : 'chevron-down');
        lucide.createIcons();
    });
});
