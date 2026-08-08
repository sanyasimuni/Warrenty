/**
 * WarrantyWise - Interactive Application Logic
 */

// ==================== Sample Data for Live Dashboard ====================
let assetsData = [
  {
    id: 1,
    name: 'Apple MacBook Pro M3',
    serial: 'SN: C02XG8H7MD6R',
    category: 'electronics',
    categoryLabel: 'Electronics',
    purchaseDate: '2025-11-15',
    expiryDate: '2027-11-15',
    daysLeft: 464,
    status: 'active',
    statusLabel: 'Active',
    price: 2499,
    icon: '💻'
  },
  {
    id: 2,
    name: 'Sony WH-1000XM5 Headphones',
    serial: 'SN: S01-8392019-B',
    category: 'electronics',
    categoryLabel: 'Electronics',
    purchaseDate: '2024-08-22',
    expiryDate: '2026-08-22',
    daysLeft: 14,
    status: 'expiring',
    statusLabel: 'Expiring Soon (14d)',
    price: 399,
    icon: '🎧'
  },
  {
    id: 3,
    name: 'Samsung 65" Neo QLED 4K TV',
    serial: 'SN: QN65QN90B-220',
    category: 'electronics',
    categoryLabel: 'Electronics',
    purchaseDate: '2024-01-10',
    expiryDate: '2027-01-10',
    daysLeft: 520,
    status: 'active',
    statusLabel: 'Active',
    price: 1899,
    icon: '📺'
  },
  {
    id: 4,
    name: 'Bosch Series 8 Built-in Dishwasher',
    serial: 'SN: SMV8YCX01G/01',
    category: 'appliances',
    categoryLabel: 'Appliances',
    purchaseDate: '2023-05-18',
    expiryDate: '2025-05-18',
    daysLeft: 0,
    status: 'expired',
    statusLabel: 'Expired (Renewable)',
    price: 1150,
    icon: '🍽️'
  },
  {
    id: 5,
    name: 'Dyson V15 Detect Vacuum',
    serial: 'SN: SV22-US-NKA4928',
    category: 'appliances',
    categoryLabel: 'Appliances',
    purchaseDate: '2025-03-12',
    expiryDate: '2027-03-12',
    daysLeft: 216,
    status: 'active',
    statusLabel: 'Active',
    price: 749,
    icon: '🧹'
  }
];

let currentFilter = 'all';

// ==================== Initialize Application ====================
document.addEventListener('DOMContentLoaded', () => {
  renderAssetsTable();
  updateDashboardStats();
  setupMobileDrawer();
  setupSmoothScrolling();
  setDefaultPurchaseDate();
});

// ==================== Render Dashboard Table ====================
function renderAssetsTable() {
  const tbody = document.getElementById('asset-tbody');
  if (!tbody) return;

  const filtered = currentFilter === 'all' 
    ? assetsData 
    : assetsData.filter(item => item.category === currentFilter);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 32px; color: var(--text-muted);">
          No products found in this category. Click "+ Add Product / Scan" to add one!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    let statusClass = 'active';
    if (item.status === 'expiring') statusClass = 'expiring';
    if (item.status === 'expired') statusClass = 'expired';

    return `
      <tr>
        <td>
          <div class="product-cell-wrapper">
            <div class="product-thumb-icon">${item.icon || '📦'}</div>
            <div>
              <div class="product-meta-name">${escapeHtml(item.name)}</div>
              <div class="product-meta-serial">${escapeHtml(item.serial)}</div>
            </div>
          </div>
        </td>
        <td><span class="badge-cat">${escapeHtml(item.categoryLabel)}</span></td>
        <td>${formatDate(item.purchaseDate)}</td>
        <td><strong>${formatDate(item.expiryDate)}</strong></td>
        <td>
          <span class="status-badge ${statusClass}">
            ● ${item.statusLabel}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm btn-outline" onclick="viewReceiptDetails('${item.id}')" title="View Invoices & Receipts">
              Invoice
            </button>
            <button class="btn btn-sm ${item.status === 'expiring' ? 'btn-primary' : 'btn-ghost'}" onclick="handleClaimAction('${item.id}')">
              ${item.status === 'expiring' ? 'Claim' : 'Details'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ==================== Filter Dashboard ====================
function filterDashboard(category) {
  currentFilter = category;
  
  // Update button active state
  ['all', 'electronics', 'appliances'].forEach(cat => {
    const btn = document.getElementById(`filter-${cat}-btn`);
    if (btn) {
      if (cat === category) {
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
      }
    }
  });

  renderAssetsTable();
}

// ==================== Update Dashboard Stats ====================
function updateDashboardStats() {
  const totalVal = assetsData.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const activeCount = assetsData.filter(i => i.status === 'active').length;
  const expiringCount = assetsData.filter(i => i.status === 'expiring').length;

  const totalValElem = document.getElementById('stat-total-val');
  const activeCountElem = document.getElementById('stat-active-count');
  const expiringCountElem = document.getElementById('stat-expiring-count');

  if (totalValElem) totalValElem.textContent = `$${totalVal.toLocaleString()}`;
  if (activeCountElem) activeCountElem.textContent = activeCount.toString();
  if (expiringCountElem) expiringCountElem.textContent = expiringCount.toString();
}

// ==================== Simulated AI OCR Scan ====================
function simulateScan() {
  const progressBar = document.getElementById('scan-progress-bar');
  const progressFill = document.getElementById('scan-progress-fill');
  
  if (!progressBar || !progressFill) return;

  progressBar.style.display = 'block';
  progressFill.style.width = '0%';

  showToast('🔍 Analyzing invoice with Smart AI OCR...');

  setTimeout(() => {
    progressFill.style.width = '60%';
  }, 300);

  setTimeout(() => {
    progressFill.style.width = '100%';
  }, 700);

  setTimeout(() => {
    // Populate sample scanned values
    const nameInput = document.getElementById('input-product-name');
    const catInput = document.getElementById('input-category');
    const dateInput = document.getElementById('input-purchase-date');
    const monthsInput = document.getElementById('input-warranty-months');
    const priceInput = document.getElementById('input-price');

    if (nameInput) nameInput.value = 'DJI Mini 4 Pro Drone (Fly More Combo)';
    if (catInput) catInput.value = 'Electronics';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (monthsInput) monthsInput.value = '24';
    if (priceInput) priceInput.value = '1099';

    showToast('✨ AI OCR Success! Extracted invoice details instantly.', 'success');
  }, 900);
}

// ==================== Add Asset Submission ====================
function handleAssetSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('input-product-name').value;
  const category = document.getElementById('input-category').value;
  const purchaseDate = document.getElementById('input-purchase-date').value;
  const months = parseInt(document.getElementById('input-warranty-months').value, 10) || 24;
  const price = parseFloat(document.getElementById('input-price').value) || 299;

  // Calculate expiry date
  const pDate = new Date(purchaseDate);
  const expDate = new Date(pDate);
  expDate.setMonth(expDate.getMonth() + months);
  const expiryDateStr = expDate.toISOString().split('T')[0];

  const now = new Date();
  const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

  let status = 'active';
  let statusLabel = 'Active';
  if (diffDays <= 0) {
    status = 'expired';
    statusLabel = 'Expired';
  } else if (diffDays <= 30) {
    status = 'expiring';
    statusLabel = `Expiring Soon (${diffDays}d)`;
  }

  let icon = '📦';
  if (category.toLowerCase() === 'electronics') icon = '⚡';
  if (category.toLowerCase() === 'appliances') icon = '🏠';
  if (category.toLowerCase() === 'vehicles') icon = '🚗';
  if (category.toLowerCase() === 'gadgets') icon = '📱';

  const newAsset = {
    id: Date.now(),
    name,
    serial: `SN: ${Math.random().toString(36).substring(2, 9).toUpperCase()}-OCR`,
    category: category.toLowerCase(),
    categoryLabel: category,
    purchaseDate,
    expiryDate: expiryDateStr,
    daysLeft: diffDays,
    status,
    statusLabel,
    price,
    icon
  };

  assetsData.unshift(newAsset);
  renderAssetsTable();
  updateDashboardStats();

  closeModal('add-product-modal');
  document.getElementById('add-asset-form').reset();
  
  const progressBar = document.getElementById('scan-progress-bar');
  if (progressBar) progressBar.style.display = 'none';

  showToast(`🎉 "${name}" added to your Digital Safe!`, 'success');
}

// ==================== Pricing Billing Toggle ====================
function toggleBillingCycle(isAnnual) {
  const priceFree = document.getElementById('price-free');
  const pricePremium = document.getElementById('price-premium');
  const periodPremium = document.getElementById('period-premium');
  const priceBusiness = document.getElementById('price-business');
  const periodBusiness = document.getElementById('period-business');

  const monthlyLabel = document.getElementById('monthly-label');
  const annualLabel = document.getElementById('annual-label');

  if (isAnnual) {
    if (pricePremium) pricePremium.textContent = '79';
    if (periodPremium) periodPremium.textContent = '/mo (billed ₹948/yr)';
    if (priceBusiness) priceBusiness.textContent = '799';
    if (periodBusiness) periodBusiness.textContent = '/mo (billed ₹9,588/yr)';
    if (monthlyLabel) monthlyLabel.style.color = 'var(--text-light)';
    if (annualLabel) annualLabel.style.color = 'var(--primary)';
    showToast('Applied 20% Annual Discount! 🎉');
  } else {
    if (pricePremium) pricePremium.textContent = '99';
    if (periodPremium) periodPremium.textContent = '/mo';
    if (priceBusiness) priceBusiness.textContent = '999';
    if (periodBusiness) periodBusiness.textContent = '/mo';
    if (monthlyLabel) monthlyLabel.style.color = 'var(--primary)';
    if (annualLabel) annualLabel.style.color = 'var(--text-muted)';
  }
}

// ==================== FAQ Accordion Toggle ====================
function toggleFaq(buttonElement) {
  const faqItem = buttonElement.closest('.faq-item');
  if (!faqItem) return;

  const isActive = faqItem.classList.contains('active');
  
  // Close all open items
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
  });

  // If clicked item wasn't open, open it
  if (!isActive) {
    faqItem.classList.add('active');
  }
}

// ==================== Modal Controls ====================
function openModal(modalId, mode = 'signup') {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (modalId === 'auth-modal') {
    const title = document.getElementById('auth-modal-title');
    const sub = document.getElementById('auth-modal-sub');
    const btn = document.getElementById('auth-submit-btn');

    if (mode === 'login') {
      if (title) title.textContent = 'Welcome Back to WarrantyWise';
      if (sub) sub.textContent = 'Log in to access your digital receipt safe';
      if (btn) btn.textContent = 'Sign In';
    } else if (mode === 'trial') {
      if (title) title.textContent = 'Start 14-Day Premium Free Trial';
      if (sub) sub.textContent = 'Full access to unlimited products, OCR, and family vault';
      if (btn) btn.textContent = 'Start Free Trial';
    } else {
      if (title) title.textContent = 'Create your Free Vault';
      if (sub) sub.textContent = 'Start tracking warranties in under 60 seconds';
      if (btn) btn.textContent = 'Get Started Free';
    }
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modals when clicking backdrop or ESC
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

// ==================== Auth Simulation ====================
function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  closeModal('auth-modal');
  showToast(`Welcome ${email}! Your vault is ready.`, 'success');
}

// ==================== Video Walkthrough Simulation ====================
function playDemoSimulation() {
  const banner = document.getElementById('video-sub-banner');
  if (banner) {
    banner.innerHTML = '▶️ Playing interactive 90-second product tour...';
    banner.style.color = '#38bdf8';
  }
  showToast('🎬 Streaming WarrantyWise HD demo walkthrough...');
}

// ==================== Asset Row Actions ====================
function viewReceiptDetails(id) {
  const item = assetsData.find(i => i.id == id);
  if (!item) return;
  showToast(`📄 Showing verified PDF invoice & serial number for ${item.name}`);
}

function handleClaimAction(id) {
  const item = assetsData.find(i => i.id == id);
  if (!item) return;
  
  if (item.status === 'expiring') {
    showToast(`⚡ Initiating warranty claim support for ${item.name}... Contacting manufacturer hotline.`, 'warning');
  } else {
    showToast(`ℹ️ ${item.name} is currently Active with ${item.daysLeft} days of warranty remaining.`);
  }
}

// ==================== Mobile Navigation Drawer ====================
function setupMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });
  }
}

// ==================== Smooth Navigation Scrolling ====================
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ==================== Toast Notification Helper ====================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  if (type === 'success') {
    toast.style.borderLeftColor = 'var(--success)';
  } else if (type === 'warning') {
    toast.style.borderLeftColor = 'var(--warning)';
  }

  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Helper: Set default purchase date to today
function setDefaultPurchaseDate() {
  const dateInput = document.getElementById('input-purchase-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

// Helper: Format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${d}, ${y}`;
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
