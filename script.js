document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".hero");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hero.classList.add("visible");
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(hero);
  });

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const threshold = 150; // Adjust scroll height to trigger

    if (scrollY > threshold) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  });
      // Animation on scroll
      document.addEventListener("DOMContentLoaded", () => {
      const hero = document.querySelector(".hero");
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            hero.classList.add("visible");
          }
        },
        { threshold: 0.4 }
      );
      observer.observe(hero);
    });

    // Body background change on hover
    const hoverZone = document.getElementById("hover-zone");
    const heading = document.querySelector("h1"); // Target h1 heading
    hoverZone.addEventListener("mouseenter", () => {
      document.body.style.backgroundColor = "#181234";
      heading.style.color = "#fff"; // Make heading white
    });
    hoverZone.addEventListener("mouseleave", () => {
      document.body.style.backgroundColor = "#ffebbf";
      heading.style.color = "#000"; // Make heading white
    });
    function scrollToSection(id) {
        document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
      }

        
