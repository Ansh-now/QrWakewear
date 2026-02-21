// ===============================================
// admin.js - NexLayer Lab Admin Dashboard
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
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
    orderBy,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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

const ADMIN_EMAIL = "anshyadav0135@gmail.com";
let currentUser = null;

function safeGet(id) {
    return document.getElementById(id);
}

function showToast(message, type = "success") {
    const toast = safeGet("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove("show"), 3000);
}

async function uploadProductImage(file) {
    const imageId = crypto.randomUUID();
    const storageRef = ref(storage, `products/${imageId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

async function loadProducts() {
    const list = safeGet("adminProductsList");
    if (!list) return;

    try {
        const snapshot = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
        const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (products.length === 0) {
            list.innerHTML = `<div class="glass-card empty-state"><h3>No Products Yet</h3></div>`;
            return;
        }

        list.innerHTML = products
            .map(
                (product) => `
            <div class="glass-card catalog-card" data-id="${product.id}">
                <div class="catalog-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="catalog-info">
                    <h3 class="catalog-title">${product.name}</h3>
                    <p class="catalog-description">${product.description}</p>
                    <p class="catalog-price">Starting at ₹${product.startingPrice}</p>
                    <div style="margin-top: 16px;">
                        <button class="btn-secondary" data-action="delete" data-id="${product.id}">Delete</button>
                    </div>
                </div>
            </div>
        `
            )
            .join("");
        lucide.createIcons();
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function addProduct() {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        showToast("Admin access required", "error");
        return;
    }

    const name = safeGet("productName")?.value.trim();
    const description = safeGet("productDescription")?.value.trim();
    const price = parseInt(safeGet("productPrice")?.value, 10);
    const imageUrl = safeGet("productImageUrl")?.value.trim();
    const imageFile = safeGet("productImageFile")?.files?.[0];

    if (!name || !description || Number.isNaN(price)) {
        showToast("Name, description, and price are required", "error");
        return;
    }

    let finalImageUrl = imageUrl;

    try {
        if (imageFile) {
            finalImageUrl = await uploadProductImage(imageFile);
        }

        if (!finalImageUrl) {
            showToast("Provide an image URL or upload an image", "error");
            return;
        }

        await addDoc(collection(db, "products"), {
            name,
            description,
            startingPrice: price,
            image: finalImageUrl,
            createdAt: serverTimestamp()
        });

        safeGet("productName").value = "";
        safeGet("productDescription").value = "";
        safeGet("productPrice").value = "199";
        safeGet("productImageUrl").value = "";
        safeGet("productImageFile").value = "";

        showToast("Product added successfully!");
        loadProducts();
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function deleteProduct(productId) {
    if (!productId) return;
    try {
        await deleteDoc(doc(db, "products", productId));
        showToast("Product deleted");
        loadProducts();
    } catch (error) {
        showToast(error.message, "error");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    const adminPanel = safeGet("adminPanel");
    const authSection = safeGet("adminAuthSection");
    const loginNote = safeGet("adminLoginNote");

    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        const isAdmin = !!user && user.email === ADMIN_EMAIL;

        if (authSection) authSection.style.display = user ? "none" : "block";
        if (adminPanel) adminPanel.style.display = isAdmin ? "block" : "none";
        const logoutBtn = safeGet("adminLogoutBtn");
        if (logoutBtn) logoutBtn.style.display = user ? "inline-flex" : "none";

        if (loginNote) {
            loginNote.textContent = isAdmin
                ? "Logged in as admin."
                : user
                    ? "You are logged in but not an admin."
                    : "";
        }

        if (isAdmin) loadProducts();
    });

    safeGet("adminLoginBtn")?.addEventListener("click", async () => {
        const email = safeGet("adminEmail")?.value.trim();
        const password = safeGet("adminPassword")?.value;
        if (!email || !password) {
            showToast("Email and password are required", "error");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            showToast("Logged in successfully!");
        } catch (error) {
            showToast(error.message, "error");
        }
    });

    safeGet("adminLogoutBtn")?.addEventListener("click", () => {
        signOut(auth);
    });

    safeGet("addProductBtn")?.addEventListener("click", addProduct);

    safeGet("adminProductsList")?.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action='delete']");
        if (!btn) return;
        const id = btn.dataset.id;
        deleteProduct(id);
    });
});
