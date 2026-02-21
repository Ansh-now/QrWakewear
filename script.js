// ===============================================
// script.js - NexLayer Lab (Full Working Version)
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
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

// Firebase Config (New Project)
const firebaseConfig = {
    apiKey: "AIzaSyCmWI6jwHR0zbiYMFwfxuh9paS3ET9qvuE",
    authDomain: "nexlayelabs.firebaseapp.com",
    projectId: "nexlayelabs",
    storageBucket: "nexlayelabs.firebasestorage.app",
    messagingSenderId: "414827106722",
    appId: "1:414827106722:web:0327f53494da1afe69a2fb"
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

const ADMIN_EMAIL = "anshyadav0135@gmail.com";

let catalogData = [];
let threeReadyPromise = null;
let ordersUnsub = null;

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
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove("show"), 3000);
}

function safeGet(id) {
    return document.getElementById(id);
}

function getCurrencySymbol() {
    return "\u20B9";
}

async function ensureThreeLoaded() {
    if (threeReadyPromise) return threeReadyPromise;
    threeReadyPromise = (async () => {
        const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js");
        const { STLLoader } = await import("https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/loaders/STLLoader.js");
        const { OBJLoader } = await import("https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/loaders/OBJLoader.js");
        const { ThreeMFLoader } = await import("https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/loaders/3MFLoader.js");
        const { OrbitControls } = await import("https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/controls/OrbitControls.js");

        window.THREE = THREE;
        window.STLLoader = STLLoader;
        window.OBJLoader = OBJLoader;
        window.ThreeMFLoader = ThreeMFLoader;
        window.OrbitControls = OrbitControls;
    })();
    return threeReadyPromise;
}

function normalizeSuggestionText(text) {
    if (!text) return [];

    let items = [];

    if (/\n\s*\d+[\).\:-]\s*/.test(text)) {
        items = text
            .split(/\n?\s*\d+[\).\:-]\s*/)
            .map((s) => s.trim())
            .filter(Boolean);
    } else {
        items = text
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    const cleaned = items
        .map((item) => item.replace(/^\s*[-•]\s*/, "").trim())
        .map((item) => item.split(" - ")[0])
        .map((item) => item.split(" — ")[0])
        .map((item) => item.split(":")[0])
        .map((item) => item.trim())
        .filter(Boolean);

    if (cleaned.length >= 5) return cleaned.slice(0, 5);

    const fallback = text
        .split(/[.\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((item) => item.split(" - ")[0].split(":")[0].trim())
        .filter(Boolean);

    return fallback.slice(0, 5);
}

// ====================== 3D PREVIEW ======================
async function loadPreview(index, file) {
    const container = document.getElementById(`preview-${index}`);
    if (!container) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["stl", "obj", "3mf"].includes(ext)) return;

    container.innerHTML = "";
    await ensureThreeLoaded();

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
        let loader = null;
        if (ext === "stl") loader = new STLLoader();
        if (ext === "obj") loader = new OBJLoader();
        if (ext === "3mf") loader = typeof ThreeMFLoader !== "undefined" ? new ThreeMFLoader() : null;

        if (!loader) {
            showToast("3D preview not available", "error");
            return;
        }

        const data = e.target.result;
        let object = loader.parse(data);

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

    if (ext === "obj") {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

// ====================== FILE UPLOAD ======================
function handleFiles(files) {
    if (!currentUser) {
        showToast("Please login first", "error");
        const modal = safeGet("authModal");
        if (modal) modal.classList.add("active");
        return;
    }

    const validFiles = Array.from(files).filter((file) => {
        const ext = "." + file.name.split(".").pop().toLowerCase();
        return [".stl", ".obj", ".3mf", ".png", ".jpg", ".jpeg"].includes(ext);
    });

    if (validFiles.length === 0) {
        showToast("Unsupported file type", "error");
        return;
    }

    uploadedFiles = [...uploadedFiles, ...validFiles];
    displayFiles();
}

function displayFiles() {
    const container = safeGet("uploadedFiles");
    const list = safeGet("filesList");

    if (!container || !list) return;

    if (uploadedFiles.length === 0) {
        container.style.display = "none";
        updateSubmitButton();
        return;
    }

    const fileCount = safeGet("fileCount");
    if (fileCount) fileCount.textContent = uploadedFiles.length;

    list.innerHTML = uploadedFiles
        .map(
            (file, index) => `
        <div class="file-item">
            <i data-lucide="file-text" class="file-icon"></i>
            <div class="file-info">
                <p class="file-name">${file.name}</p>
                <p class="file-size">${(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <div class="file-actions">
                <button class="preview-file-btn" data-action="preview" data-index="${index}">
                    <i data-lucide="eye"></i>
                </button>
                <button class="remove-file-btn" data-action="remove" data-index="${index}">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="file-preview" id="preview-${index}"></div>
        </div>
    `
        )
        .join("");

    container.style.display = "block";
    lucide.createIcons();

    uploadedFiles.forEach((file, index) => loadPreview(index, file));
    updateSubmitButton();
}

function removeFileByIndex(index) {
    uploadedFiles.splice(index, 1);
    displayFiles();
}

window.removeFile = (index) => removeFileByIndex(index);

function updateSubmitButton() {
    const submitBtn = safeGet("submitOrderBtn");
    if (submitBtn) submitBtn.disabled = uploadedFiles.length === 0;
}

async function renderModelPreview(container, file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["stl", "obj", "3mf"].includes(ext)) return;

    await ensureThreeLoaded();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
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
        let loader = null;
        if (ext === "stl") loader = new STLLoader();
        if (ext === "obj") loader = new OBJLoader();
        if (ext === "3mf") loader = typeof ThreeMFLoader !== "undefined" ? new ThreeMFLoader() : null;

        if (!loader) {
            showToast("3D preview not available", "error");
            return;
        }

        const data = e.target.result;
        let object = loader.parse(data);

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

    if (ext === "obj") {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

async function openFilePreview(index) {
    const file = uploadedFiles[index];
    if (!file) return;

    const modal = safeGet("filePreviewModal");
    const body = safeGet("filePreviewBody");
    const title = safeGet("filePreviewTitle");
    if (!modal || !body || !title) return;

    title.textContent = file.name;
    body.innerHTML = "";

    const ext = file.name.split(".").pop().toLowerCase();
    const imageExts = ["png", "jpg", "jpeg", "gif", "webp"];

    if (imageExts.includes(ext)) {
        const img = document.createElement("img");
        const url = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(url);
        img.src = url;
        body.appendChild(img);
    } else if (["stl", "obj", "3mf"].includes(ext)) {
        const canvasWrap = document.createElement("div");
        canvasWrap.className = "file-preview-canvas";
        body.appendChild(canvasWrap);
        await renderModelPreview(canvasWrap, file);
    } else {
        const msg = document.createElement("div");
        msg.className = "file-preview-message";
        msg.textContent = "Preview not available for this file type. Use the button below to open it.";
        body.appendChild(msg);

        const link = document.createElement("a");
        const url = URL.createObjectURL(file);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
        link.className = "btn-secondary";
        link.textContent = "Open File";
        link.addEventListener("click", () => setTimeout(() => URL.revokeObjectURL(url), 1000));
        body.appendChild(link);
    }

    modal.classList.add("active");
}

function closeFilePreview() {
    const modal = safeGet("filePreviewModal");
    const body = safeGet("filePreviewBody");
    if (body) body.innerHTML = "";
    if (modal) modal.classList.remove("active");
}

// ====================== CATALOG ======================
function renderCatalog(products) {
    const grid = safeGet("catalogGrid");
    if (!grid) return;

    catalogData = products;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="glass-card empty-state">
                <h3>No Products Yet</h3>
                <p class="text-secondary">Admin can add products from the admin panel.</p>
            </div>`;
        return;
    }

    grid.innerHTML = products
        .map(
            (product) => `
        <div class="glass-card catalog-card" onclick="openCustomizeModal('${product.id}')">
            <div class="catalog-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="catalog-info">
                <h3 class="catalog-title">${product.name}</h3>
                <p class="catalog-description">${product.description}</p>
                <p class="catalog-price">Starting at ${getCurrencySymbol()}${product.startingPrice}</p>
            </div>
        </div>
    `
        )
        .join("");
    lucide.createIcons();
}

function loadCatalog() {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    onSnapshot(
        q,
        (snapshot) => {
            const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            renderCatalog(products);
        },
        () => {
            renderCatalog([]);
        }
    );
}

window.openCustomizeModal = (productId) => {
    if (!currentUser) {
        showToast("Please login to customize", "error");
        const modal = safeGet("authModal");
        if (modal) modal.classList.add("active");
        return;
    }
    currentProduct = catalogData.find((p) => `${p.id}` === `${productId}`) || null;
    if (!currentProduct) {
        showToast("Product not found", "error");
        return;
    }
    const title = safeGet("modalTitle");
    if (title && currentProduct) title.textContent = `Customize ${currentProduct.name}`;
    const modal = safeGet("customizeModal");
    if (modal) modal.classList.add("active");
};

// ====================== CUSTOMIZE MODAL ======================
function updatePreview() {
    const textInput = safeGet("customText");
    const previewText = safeGet("previewText");
    if (previewText) previewText.textContent = textInput && textInput.value.trim() ? textInput.value.trim() : "Your text here";

    const sizeValue = safeGet("customSize")?.value || "medium";
    const colorValue = safeGet("customColor")?.value || "black";
    const materialValue = safeGet("customMaterial")?.value || "pla";

    const sizeLabel = sizes.find((s) => s.value === sizeValue)?.label || "Medium";
    const materialLabel = materials.find((m) => m.value === materialValue)?.label || "PLA";

    const previewSize = safeGet("previewSize");
    const previewColor = safeGet("previewColor");
    const previewMaterial = safeGet("previewMaterial");

    if (previewSize) previewSize.textContent = `Size: ${sizeLabel}`;
    if (previewColor) previewColor.textContent = `Color: ${colorValue}`;
    if (previewMaterial) previewMaterial.textContent = `Material: ${materialLabel}`;
}

function calculatePrice() {
    if (!currentProduct) return;
    const base = currentProduct.startingPrice;
    const sizePrice = sizes.find((s) => s.value === safeGet("customSize")?.value)?.price || 0;
    const matPrice = materials.find((m) => m.value === safeGet("customMaterial")?.value)?.price || 0;
    const qty = parseInt(safeGet("customQuantity")?.value, 10) || 1;
    const total = (base + sizePrice + matPrice) * qty;

    const totalPrice = safeGet("totalPrice");
    if (totalPrice) totalPrice.textContent = `${getCurrencySymbol()}${total}`;
}

async function placeOrder() {
    const textValue = safeGet("customText")?.value.trim() || "";
    if (!textValue) {
        showToast("Please enter custom text", "error");
        return;
    }

    if (!currentProduct || !currentUser) return;

    const orderData = {
        userId: currentUser.uid,
        product: currentProduct.name,
        customization: {
            text: textValue,
            size: safeGet("customSize")?.value,
            color: safeGet("customColor")?.value,
            material: safeGet("customMaterial")?.value,
            quantity: parseInt(safeGet("customQuantity")?.value, 10)
        },
        totalPrice: parseInt((safeGet("totalPrice")?.textContent || "").replace(getCurrencySymbol(), ""), 10),
        status: "Submitted",
        timestamp: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "orders"), orderData);
        showToast("Order placed successfully!");
        const modal = safeGet("customizeModal");
        if (modal) modal.classList.remove("active");
        loadDashboard();
    } catch (error) {
        showToast(error.message, "error");
    }
}

// ====================== SUBMIT CUSTOM ORDER ======================
async function submitCustomOrder() {
    if (uploadedFiles.length === 0) {
        showToast("Please upload at least one file", "error");
        return;
    }

    if (!currentUser) return;

    const orderData = {
        userId: currentUser.uid,
        material: safeGet("orderMaterial")?.value,
        color: safeGet("orderColor")?.value,
        quantity: parseInt(safeGet("orderQuantity")?.value, 10),
        notes: safeGet("orderNotes")?.value,
        status: "Submitted",
        timestamp: new Date().toISOString(),
        files: []
    };

    try {
        const docRef = await addDoc(collection(db, "orders"), orderData);
        const orderId = docRef.id;

        const filesMeta = await Promise.all(
            uploadedFiles.map(async (file) => {
                const storageRef = ref(storage, `orders/${orderId}/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                return { name: file.name, type: file.type || "", url };
            })
        );

        await updateDoc(doc(db, "orders", orderId), { files: filesMeta });

        showToast(`Order Submitted! ID: ${orderId}`);
        uploadedFiles = [];
        displayFiles();
        const notes = safeGet("orderNotes");
        if (notes) notes.value = "";
        loadDashboard();
    } catch (error) {
        showToast(error.message, "error");
    }
}

// ====================== DASHBOARD ======================
function loadDashboard() {
    const container = safeGet("dashboardContent");
    if (!container) return;

    if (!currentUser) {
        if (ordersUnsub) {
            ordersUnsub();
            ordersUnsub = null;
        }
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
        ? query(collection(db, "orders"), orderBy("timestamp", "desc"))
        : query(collection(db, "orders"), where("userId", "==", currentUser.uid), orderBy("timestamp", "desc"));

    if (ordersUnsub) {
        ordersUnsub();
    }

    ordersUnsub = onSnapshot(
        q,
        (snapshot) => {
            const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

            if (orders.length === 0) {
                container.innerHTML = `<div class="glass-card empty-state"><h3>No Orders Yet</h3></div>`;
                return;
            }

            container.innerHTML = `
                <div class="orders-list">
                    ${orders
                        .map(
                            (order) => `
                        <div class="glass-card order-card-item">
                            <div class="order-header">
                                <div class="order-id-section">
                                    <i data-lucide="${getStatusIcon(order.status)}"></i>
                                    <div>
                                        <p class="order-id">${order.id}</p>
                                        <p class="order-date">${new Date(order.timestamp).toLocaleDateString("en-IN")}</p>
                                    </div>
                                </div>
                                <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                            </div>
                            ${
                                isAdmin
                                    ? `
                                <select id="status-${order.id}" class="dark-select">
                                    <option value="Submitted" ${order.status === "Submitted" ? "selected" : ""}>Submitted</option>
                                    <option value="Reviewing" ${order.status === "Reviewing" ? "selected" : ""}>Reviewing</option>
                                    <option value="Printing" ${order.status === "Printing" ? "selected" : ""}>Printing</option>
                                    <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
                                </select>
                                <button onclick="updateOrderStatus('${order.id}')" class="btn-primary" style="margin-left:10px;">Update Status</button>
                            `
                                    : ""
                            }
                        </div>
                    `
                        )
                        .join("")}
                </div>`;
            lucide.createIcons();
        },
        (error) => {
            showToast(error.message, "error");
        }
    );
}

window.updateOrderStatus = async (orderId) => {
    const newStatus = safeGet(`status-${orderId}`)?.value;
    if (!newStatus) return;
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    showToast("Status updated!");
    loadDashboard();
};

function getStatusIcon(status) {
    const icons = { Submitted: "clock", Reviewing: "package", Printing: "package", Completed: "check-circle" };
    return icons[status] || "clock";
}

// ====================== PROJECT SUGGESTION (AI) ======================
async function getProjectSuggestions() {
    const keyword = safeGet("projectKeyword")?.value.trim();
    if (!keyword) return showToast("Enter a keyword", "error");

    try {
        const prompt = `Generate 5 college project ideas for 3D printing related to ${keyword}`;
        const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
        const text = await res.text();
        const suggestions = normalizeSuggestionText(text);
        if (suggestions.length === 0) {
            showToast("No suggestions found. Try another keyword.", "error");
            return;
        }

        const list = safeGet("suggestionsList");
        if (list) {
            list.innerHTML = suggestions
                .map(
                    (s, i) => `
            <div class="suggestion-item">
                <div class="suggestion-text">
                    <span class="suggestion-number">${i + 1}.</span> ${s}
                </div>
                <button class="btn-whatsapp" onclick="contactWhatsApp('${s.replace(/'/g, "\\'")}')">
                    Discuss on WhatsApp
                </button>
            </div>
        `
                )
                .join("");
        }

        const container = safeGet("suggestionsContainer");
        if (container) container.style.display = "block";
        lucide.createIcons();
    } catch (e) {
        showToast("Failed to get suggestions", "error");
    }
}

window.contactWhatsApp = (project) => {
    const msg = encodeURIComponent(`Hi NexLayer Lab! I like this project: "${project}". Can you help with 3D printing?`);
    window.open(`https://wa.me/917078294661?text=${msg}`, "_blank");
};

// ====================== INIT ======================
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    // Auth
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        isAdmin = !!user && user.email === ADMIN_EMAIL;

        const loginBtn = safeGet("loginBtn");
        const logoutBtn = safeGet("logoutBtn");
        const mobileLoginBtn = safeGet("mobileLoginBtn");
        const mobileLogoutBtn = safeGet("mobileLogoutBtn");
        const userGreeting = safeGet("userGreeting");
        const userEmail = safeGet("userEmail");

        if (loginBtn) loginBtn.style.display = user ? "none" : "inline-flex";
        if (logoutBtn) logoutBtn.style.display = user ? "inline-flex" : "none";
        if (mobileLoginBtn) mobileLoginBtn.style.display = user ? "none" : "inline-flex";
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = user ? "inline-flex" : "none";
        if (userGreeting) userGreeting.style.display = user ? "inline" : "none";
        if (user && userEmail) userEmail.textContent = user.email.split("@")[0];

        loadDashboard();
    });

    // Auth modal and actions
    safeGet("loginBtn")?.addEventListener("click", () => {
        safeGet("authModal")?.classList.add("active");
    });

    safeGet("mobileLoginBtn")?.addEventListener("click", () => {
        safeGet("authModal")?.classList.add("active");
        safeGet("mobileNav")?.classList.remove("active");
    });

    safeGet("authClose")?.addEventListener("click", () => {
        safeGet("authModal")?.classList.remove("active");
    });

    safeGet("toggleAuth")?.addEventListener("click", () => {
        const title = safeGet("authTitle");
        const btn = safeGet("authBtn");
        if (!title || !btn) return;
        if (title.textContent === "Login") {
            title.textContent = "Sign Up";
            btn.textContent = "Sign Up";
        } else {
            title.textContent = "Login";
            btn.textContent = "Login";
        }
    });

    safeGet("authBtn")?.addEventListener("click", async () => {
        const email = safeGet("authEmail")?.value.trim();
        const password = safeGet("authPassword")?.value;
        const isSignup = safeGet("authBtn")?.textContent === "Sign Up";

        if (!email || !password) {
            showToast("Email and password are required", "error");
            return;
        }

        try {
            if (isSignup) {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast("Account created successfully!");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Logged in successfully!");
            }
            currentUser = auth.currentUser;
            isAdmin = !!currentUser && currentUser.email === ADMIN_EMAIL;
            loadDashboard();
            safeGet("authModal")?.classList.remove("active");
        } catch (error) {
            showToast(error.message, "error");
        }
    });

    safeGet("googleAuthBtn")?.addEventListener("click", async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            showToast("Logged in with Google!");
            currentUser = auth.currentUser;
            isAdmin = !!currentUser && currentUser.email === ADMIN_EMAIL;
            loadDashboard();
            safeGet("authModal")?.classList.remove("active");
        } catch (error) {
            showToast(error.message, "error");
        }
    });

    safeGet("logoutBtn")?.addEventListener("click", () => {
        signOut(auth);
    });

    safeGet("mobileLogoutBtn")?.addEventListener("click", () => {
        signOut(auth);
        safeGet("mobileNav")?.classList.remove("active");
    });

    // Customize modal controls
    ["customText", "customSize", "customColor", "customMaterial", "customQuantity"].forEach((id) => {
        const el = safeGet(id);
        if (el) {
            el.addEventListener("input", () => {
                updatePreview();
                calculatePrice();
            });
        }
    });

    safeGet("placeOrderBtn")?.addEventListener("click", placeOrder);
    safeGet("modalClose")?.addEventListener("click", () => safeGet("customizeModal")?.classList.remove("active"));

    // File upload
    const uploadZone = safeGet("uploadZone");
    const fileInput = safeGet("fileInput");

    if (uploadZone && fileInput) {
        uploadZone.addEventListener("click", () => fileInput.click());
        uploadZone.addEventListener("touchend", (e) => {
            e.preventDefault();
            fileInput.click();
        });
        uploadZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            uploadZone.classList.add("drag-active");
        });
        uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-active"));
        uploadZone.addEventListener("drop", (e) => {
            e.preventDefault();
            uploadZone.classList.remove("drag-active");
            handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener("change", (e) => {
            handleFiles(e.target.files);
            e.target.value = "";
        });
    }

    const filesList = safeGet("filesList");
    if (filesList) {
        filesList.addEventListener("click", (e) => {
            const button = e.target.closest("button[data-action]");
            if (!button) return;
            const index = parseInt(button.dataset.index, 10);
            if (Number.isNaN(index)) return;

            if (button.dataset.action === "remove") {
                removeFileByIndex(index);
                return;
            }

            if (button.dataset.action === "preview") {
                openFilePreview(index);
            }
        });
    }

    safeGet("filePreviewClose")?.addEventListener("click", closeFilePreview);

    safeGet("submitOrderBtn")?.addEventListener("click", submitCustomOrder);

    // Project suggestions
    safeGet("suggestBtn")?.addEventListener("click", getProjectSuggestions);

    // Navbar scroll effect
    window.addEventListener("scroll", () => {
        const nav = safeGet("navbar");
        if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
    });

    // Mobile menu
    safeGet("mobileMenuToggle")?.addEventListener("click", () => {
        safeGet("mobileNav")?.classList.toggle("active");
    });

    // Project toggle
    safeGet("projectCardHeader")?.addEventListener("click", () => {
        const content = safeGet("projectContent");
        const chevron = safeGet("projectChevron");
        if (!content || !chevron) return;
        const isHidden = content.style.display === "none" || !content.style.display;
        content.style.display = isHidden ? "block" : "none";
        chevron.setAttribute("data-lucide", isHidden ? "chevron-up" : "chevron-down");
        lucide.createIcons();
    });

    // Initial render
    loadCatalog();
    loadDashboard();
    updatePreview();
    calculatePrice();
    updateSubmitButton();
});
