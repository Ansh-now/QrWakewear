/*
  admin.js - simplified demo admin (no Firebase)
  Shows demo orders saved in localStorage and allows clearing.
*/
(function(){
    const listEl = document.getElementById('demoList');
    const refreshBtn = document.getElementById('refreshBtn');
    const clearBtn = document.getElementById('clearBtn');
  
    function loadDemo() {
      try { return JSON.parse(localStorage.getItem('nexlayer_demo_orders') || '[]'); }
      catch(e){ return []; }
    }
  
    function render(){
      const arr = loadDemo();
      if(!arr.length){
        listEl.textContent = 'No demo orders stored in your browser.';
        return;
      }
      listEl.innerHTML = arr.slice().reverse().map(o=>{
        return `<div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.03)"><div style="font-weight:800">${o.orderId}</div><div class="s-sub">${o.createdAt} • ${o.modelName || ''}</div></div>`;
      }).join('');
    }
  
    refreshBtn.addEventListener('click', render);
    clearBtn.addEventListener('click', function(){
      if(confirm('Clear demo orders from browser storage?')) {
        localStorage.removeItem('nexlayer_demo_orders');
        render();
      }
    });
  
    render();
  })();
