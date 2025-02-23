"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // ---- Star Background Creation ----
  const starsContainer = document.querySelector(".stars");
  const numberOfStars = 150;
  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    // Random position within the viewport
    star.style.top = Math.random() * 150 + "%";
    star.style.left = Math.random() * 150 + "%";
    // Randomize animation duration for variety
    star.style.animationDuration = 3 + Math.random() * 4 + "s";
    starsContainer.appendChild(star);
  }

  // ---- Login Popup Functionality with Background Blur ----
  const profileBtn = document.getElementById("profile-btn");
  const loginPopup = document.getElementById("login-popup");
  const closeLogin = document.getElementById("close-login");
  const pageContent = document.getElementById("page-content");

  profileBtn.addEventListener("click", function () {
    loginPopup.style.display = "block";
    if (pageContent) {
      pageContent.classList.add("blurred");
    }
  });

  closeLogin.addEventListener("click", function () {
    loginPopup.style.display = "none";
    if (pageContent) {
      pageContent.classList.remove("blurred");
    }
  });

  // ---- Navigation Section Switching (for internal sections) ----
  const navBtns = document.querySelectorAll("nav ul li a.nav-btn");
  const contentSections = document.querySelectorAll(".content-section");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      // Allow default behavior for external links (e.g., buy.html)
      if (btn.getAttribute("href").includes("buy.html")) return;

      e.preventDefault();
      const sectionId = btn.getAttribute("data-section");
      if (!sectionId) return;

      // Hide all content sections
      contentSections.forEach((section) => {
        section.classList.remove("active");
      });

      // Show the selected section
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });
});

// ---- Redirect to Buy Page ----
function redirectToBuy() {
  window.location.href = "buy.html";
}
const currentHour = new Date().getHours();
if (currentHour >= 6 && currentHour < 18) {
  document.body.classList.add("day-background");
  document.body.classList.remove("night-background");
} else {
  document.body.classList.add("night-background");
  document.body.classList.remove("day-background");
}
// ❌ Close Login Popup on Click
const closeLogin = document.querySelector(".close-login");
closeLogin.addEventListener("click", function () {
  window.location.href = "index.html"; // Redirect to homepage
});

// 🔒 Handle Login Form Submission
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  alert("Login successful!"); // Placeholder for actual login
});


// 🎞️ Image Stack Slider Animation
const images = document.querySelectorAll(".slider-image");
let currentImage = 0;

function showNextImage() {
  images[currentImage].classList.remove("active");
  currentImage = (currentImage + 1) % images.length;
  images[currentImage].classList.add("active");
}

images[currentImage].classList.add("active");
setInterval(showNextImage, 3000); // Swipe every 3 seconds
