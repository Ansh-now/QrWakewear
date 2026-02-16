/* app.js - vanilla JS for interactions, form demo storage, validation, menu, toast, smooth scroll */
(function(){
    // Utilities
    function uid(){ return 'NXL' + Date.now().toString(36).slice(-6).toUpperCase(); }
    function el(id){ return document.getElementById(id); }
    function showToast(msg, timeout=3500){
      const t = el('toast'); if(!t) return;
      t.textContent = msg; t.style.display = 'block'; t.setAttribute('aria-hidden','false');
      setTimeout(()=>{ t.style.display='none'; t.setAttribute('aria-hidden','true'); }, timeout);
    }
  
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', function(e){
        const target = document.querySelector(this.getAttribute('href'));
        if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); document.getElementById('nav')?.classList.remove('open'); }
      });
    });
  
    // Mobile menu
    const menuBtn = el('menuBtn'), nav = el('nav');
    if(menuBtn && nav){
      menuBtn.addEventListener('click', ()=> nav.classList.toggle('open'));
    }
  
    // Header compact on scroll for better mobile UX
    const header = el('header');
    let lastScroll = 0;
    window.addEventListener('scroll', ()=>{
      const sc = window.scrollY || window.pageYOffset;
      if(!header) return;
      if(sc > 40 && sc > lastScroll){ header.classList.add('compact'); }
      else { header.classList.remove('compact'); }
      lastScroll = sc;
    }, {passive:true});
  
    // Year
    const y = new Date().getFullYear(); const yearEl = el('year'); if(yearEl) yearEl.textContent = y;
  
    // Drag & drop + upload form
    const dropzone = el('dropzone'), modelFile = el('modelFile'), imgFile = el('imgFile');
    const orderForm = el('orderForm'), resetBtn = el('resetBtn');
  
    ;['dragenter','dragover'].forEach(ev=>{
      dropzone?.addEventListener(ev, e=>{
        e.preventDefault(); e.stopPropagation(); dropzone.classList.add('dragover');
      });
    });
    ;['dragleave','drop'].forEach(ev=>{
      dropzone?.addEventListener(ev, e=>{
        e.preventDefault(); e.stopPropagation(); if(ev==='drop'){
          const f = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
          if(f && modelFile) modelFile.files = e.dataTransfer.files;
        }
        dropzone.classList.remove('dragover');
      });
    });
  
    function loadDemo(){ try{return JSON.parse(localStorage.getItem('nexlayer_demo_orders')||'[]'); }catch(e){return []} }
    function saveDemo(a){ localStorage.setItem('nexlayer_demo_orders', JSON.stringify(a)); }
  
    orderForm?.addEventListener('submit', function(e){
      e.preventDefault();
      const f = modelFile.files[0];
      if(!f){ showToast('Please add a 3D model file (STL/OBJ/3MF).'); return; }
      const ext = (f.name.split('.').pop()||'').toLowerCase();
      if(!['stl','obj','3mf'].includes(ext)){ showToast('Invalid file type. Use STL/OBJ/3MF.'); return; }
      if(f.size > 50 * 1024 * 1024){ showToast('File too large. Max 50MB.'); return; }
      const id = uid();
      const order = {
        orderId:id, createdAt: new Date().toISOString(), status:'Submitted (demo)',
        material: el('material')?.value || 'PLA', color: el('color')?.value || '',
        qty: Number(el('qty')?.value||1), phone: el('phone')?.value||'', modelName: f.name
      };
      const arr = loadDemo(); arr.push(order); saveDemo(arr);
      showToast('Order saved (demo) — ID: ' + id);
      orderForm.reset();
    });
  
    resetBtn?.addEventListener('click', ()=> orderForm.reset());
  
    // Contact form simple validation
    const contactForm = el('contactForm');
    contactForm?.addEventListener('submit', function(e){
      e.preventDefault();
      const name = el('cname').value.trim(), email = el('cemail').value.trim(), msg = el('cmsg').value.trim();
      if(!name || !email || !msg){ showToast('Please complete the contact form.'); return; }
      showToast('Message sent (demo). We will reply to ' + email);
      contactForm.reset();
    });
  
    // Accordion: only one FAQ open at a time
    (function(){
      const details = document.querySelectorAll('.faq-card details');
      details.forEach(d=>{
        d.addEventListener('toggle', function(){
          if(!d.open) return;
          details.forEach(other=>{
            if(other !== d && other.open) other.open = false;
          });
        });
      });
    })();
  
    // Small enhancement: reveal-on-scroll
    const revealEls = document.querySelectorAll('.card, .service-card, .step, .gallery-item');
    const io = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting) { en.target.classList.add('reveal'); io.unobserve(en.target); }
      });
    }, {threshold:0.12});
    revealEls.forEach(n=>io.observe(n));
  
    /* Hero canvas particle animation (lightweight) */
    (function(){
      const canvas = document.getElementById('heroCanvas');
      if(!canvas) return;
      const ctx = canvas.getContext('2d');
      let w = canvas.clientWidth, h = canvas.clientHeight;
      function resize(){ w = canvas.width = canvas.clientWidth; h = canvas.height = canvas.clientHeight; }
      window.addEventListener('resize', resize);
      resize();
  
      const particles = [];
      const count = Math.max(12, Math.floor(w/40));
      for(let i=0;i<count;i++){
        particles.push({
          x: Math.random()*w,
          y: Math.random()*h,
          r: 1 + Math.random()*3,
          vx: (Math.random()-0.5)*0.4,
          vy: (Math.random()-0.5)*0.4,
          hue: 180 + Math.random()*60
        });
      }
  
      function frame(){
        ctx.clearRect(0,0,w,h);
        // subtle glow background
        const g = ctx.createLinearGradient(0,0,w,h);
        g.addColorStop(0,'rgba(0,182,255,0.04)'); g.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
        // draw particles
        particles.forEach(p=>{
          p.x += p.vx; p.y += p.vy;
          if(p.x < -10) p.x = w+10; if(p.x > w+10) p.x = -10;
          if(p.y < -10) p.y = h+10; if(p.y > h+10) p.y = -10;
          ctx.beginPath();
          const grad = ctx.createRadialGradient(p.x,p.y,p.r*0.1,p.x,p.y,p.r*6);
          grad.addColorStop(0,`hsla(${p.hue},100%,60%,0.9)`);
          grad.addColorStop(0.3,`hsla(${p.hue},100%,60%,0.18)`);
          grad.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.arc(p.x,p.y,p.r*6,0,Math.PI*2);
          ctx.fill();
        });
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    })();
  
    /* Services carousel - ensure smooth touch on mobile (native scrolling used) */
    (function(){
      const track = document.querySelector('.services-carousel .carousel-track');
      if(!track) return;
      // Small enhancement: allow wheel to scroll horizontally
      track.addEventListener('wheel', (e)=>{
        if(Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
          e.preventDefault();
          track.scrollLeft += e.deltaY;
        }
      }, {passive:false});
    })();
  
    /* Simple on-site "AI" project idea suggester (no external calls) moved to College Projects section */
    (function(){
      const mapping = {
        robotics: ['Autonomous line-following robot (prototype)', 'Robotic arm for pick-and-place (mini)'],
        iot: ['Smart plant monitor (soil moisture + app)', 'WiFi-enabled attendance logger'],
        renewable: ['Solar phone charger prototype', 'Mini wind turbine model for labs'],
        drone: ['Lightweight quadcopter frame (printed)','Payload-release drone mount'],
        mechanical: ['Gearbox demonstrator (parametric)', 'Custom hinge with tolerance tests']
      };
      function suggest(q){
        if(!q) return ["Try a keyword like: robotics, IoT, renewable, drone, mechanical"];
        q = q.toLowerCase();
        let out = new Set();
        Object.keys(mapping).forEach(k=>{
          if(q.includes(k)) mapping[k].forEach(it=>out.add(it));
        });
        if(out.size) return Array.from(out);
        // fuzzy match
        Object.keys(mapping).forEach(k=>{
          if(k.slice(0,3) && q.includes(k.slice(0,3))) mapping[k].forEach(it=>out.add(it));
        });
        if(out.size) return Array.from(out);
        return ['3D printed phone stand with cable management','Parametric gear set for learning','Custom keycap set for mechanical keyboard'];
      }
  
      const btnMain = document.getElementById('aiBtnMain');
      const inputMain = document.getElementById('aiQueryMain');
      const outMain = document.getElementById('aiResultsMain');
  
      // Also wire the in-card Suggest buttons to open the College Projects input and show suggestions (mobile/desktop buttons)
      const cardBtnDesk = document.getElementById('aiBtn');
      const cardBtnMobile = document.getElementById('aiBtnMobile');
  
      function renderResults(res, target){
        if(!target) return;
        target.innerHTML = res.map(r=>`• ${r}`).join('<br>');
      }
  
      if(btnMain){
        btnMain.addEventListener('click', ()=>{
          const q = (inputMain?.value||'').trim();
          const res = suggest(q);
          renderResults(res, outMain);
        });
      }
  
      [cardBtnDesk, cardBtnMobile].forEach(b=>{
        if(!b) return;
        b.addEventListener('click', ()=>{
          // scroll to college projects section on click and focus input
          const sec = document.getElementById('college-projects');
          if(sec) sec.scrollIntoView({behavior:'smooth', block:'start'});
          setTimeout(()=> inputMain?.focus(), 600);
        });
      });
    })();
  
    /* Rotating PNG: rotate image in 3D as user scrolls */
    (function(){
      const img = document.getElementById('rotatingImage');
      if(!img) return;
      function update(){
        const rect = img.getBoundingClientRect();
        const mid = rect.top + rect.height/2;
        const winMid = window.innerHeight/2;
        const dist = (winMid - mid);
        const max = window.innerHeight/1.2;
        const pct = Math.max(-1, Math.min(1, dist / max));
        const rotY = pct * 20; // rotate up to +/-20deg on Y
        const rotX = pct * 12; // rotate up to +/-12deg on X
        img.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      }
      window.addEventListener('scroll', update, {passive:true});
      window.addEventListener('resize', update);
      // initial
      update();
    })();
  
  })();
