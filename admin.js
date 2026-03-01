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
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCmWI6jwHR0zbiYMFwfxuh9paS3ET9qvuE",
    authDomain: "nexlayelabs.firebaseapp.com",
    databaseURL: "https://nexlayelabs-default-rtdb.firebaseio.com",
    projectId: "nexlayelabs",
    storageBucket: "nexlayelabs.firebasestorage.app",
    messagingSenderId: "414827106722",
    appId: "1:414827106722:web:0327f53494da1afe69a2fb",
    measurementId: "G-RXBD8D8Q5Q"
  };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

function reportError(context, error) {
    console.error(`${context} failed:`, error);
    const message = error?.message || `${context} failed unexpectedly`;
    showToast(message, "error");
}

function setButtonLoading(button, isLoading, text = "Loading...") {
    if (!button) return;
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = text;
        button.classList.add("is-loading");
        button.disabled = true;
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.classList.remove("is-loading");
        button.disabled = false;
    }
}
async function loadProducts() {

    const list = safeGet("adminProductsList");
    if (!list) return;

    try {

        list.innerHTML = `<div class="glass-card empty-state"><h3>Loading Products...</h3></div>`;

        const snapshot = await getDocs(collection(db, "products"));

        if (snapshot.empty) {
            list.innerHTML = `<div class="glass-card empty-state"><h3>No Products Yet</h3></div>`;
            return;
        }

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        list.innerHTML = products.map(product => `
            <div class="glass-card catalog-card" data-id="${product.id}">
                <div class="catalog-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p>₹${product.startingPrice}</p>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Load products error:", error);
        showToast("Failed to load products", "error");
    }
}

async function addProduct() {
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        showToast("Admin access required", "error");
        return;
    }

    const productId = safeGet("productId")?.value.trim();
    const name = safeGet("productName")?.value.trim();
    const description = safeGet("productDescription")?.value.trim();
    const price = parseInt(safeGet("productPrice")?.value, 10);
    const imageUrl = safeGet("productImageUrl")?.value.trim();

    if (!name || !description || Number.isNaN(price)) {
        showToast("Name, description, and price are required", "error");
        return;
    }

    if (!imageUrl) {
        showToast("Image URL is required", "error");
        return;
    }

    const finalImageUrl = imageUrl;

    const actionBtn = safeGet("addProductBtn");
    try {
        setButtonLoading(actionBtn, true, productId ? "Updating..." : "Adding...");
        if (!finalImageUrl) {
            showToast("Provide an image URL", "error");
            return;
        }

        if (productId) {
            await updateDoc(doc(db, "products", productId), {
                name,
                description,
                startingPrice: price,
                image: finalImageUrl,
                updatedAt: serverTimestamp()
            });
            showToast("Product updated successfully!");
        } else {
            await addDoc(collection(db, "products"), {
                name,
                description,
                startingPrice: price,
                image: finalImageUrl,
                createdAt: Date.now()
            });
            showToast("Product added successfully!");
        }

        resetForm();

        loadProducts();
    } catch (error) {
        reportError(productId ? "Update product" : "Add product", error);
    } finally {
        setButtonLoading(actionBtn, false);
    }
}

async function deleteProduct(productId) {
    if (!productId) return;
    try {
        await deleteDoc(doc(db, "products", productId));
        showToast("Product deleted");
        loadProducts();
    } catch (error) {
        reportError("Delete product", error);
    }
}

function resetForm() {
    safeGet("productId").value = "";
    safeGet("productName").value = "";
    safeGet("productDescription").value = "";
    safeGet("productPrice").value = "199";
    safeGet("productImageUrl").value = "";
    safeGet("addProductBtn").textContent = "Add Product";
    const cancelBtn = safeGet("cancelEditBtn");
    if (cancelBtn) cancelBtn.style.display = "none";
}

function populateForm(product) {
    safeGet("productId").value = product.id;
    safeGet("productName").value = product.name || "";
    safeGet("productDescription").value = product.description || "";
    safeGet("productPrice").value = product.startingPrice || 0;
    safeGet("productImageUrl").value = product.image || "";
    safeGet("addProductBtn").textContent = "Update Product";
    const cancelBtn = safeGet("cancelEditBtn");
    if (cancelBtn) cancelBtn.style.display = "inline-flex";
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
            reportError("Admin login", error);
        }
    });

    safeGet("adminLogoutBtn")?.addEventListener("click", () => {
        signOut(auth);
    });

    safeGet("addProductBtn")?.addEventListener("click", addProduct);
    safeGet("cancelEditBtn")?.addEventListener("click", resetForm);

    safeGet("adminProductsList")?.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest("button[data-action='delete']");
        const editBtn = e.target.closest("button[data-action='edit']");
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            deleteProduct(id);
        }
        if (editBtn) {
            const id = editBtn.dataset.id;
            const name = editBtn.dataset.name;
            const description = editBtn.dataset.description;
            const price = parseInt(editBtn.dataset.price, 10);
            const image = editBtn.dataset.image;
            populateForm({ id, name, description, startingPrice: price, image });
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
});
