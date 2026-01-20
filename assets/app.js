// assets/app.js
const seed = [
  { product: "Client API", start: "2025-12-17", expiry: "2026-12-17", plan: "Tier 1", billing: "Self Pay", status: "Active", devices: ["device001", "device002"], billingProfile: { billName: "Example Customer", billEmail: "billing@example.com", billAddress: "Main Street 1, City, 12345", billCountry: "Austria", billVat: "", billMethod: "Self Pay" } },
  { product: "Disease Model", start: "2024-05-08", expiry: "2026-05-08", plan: "Some Plan", billing: "Self Pay", status: "Active" },
  { product: "FarmView with Satellite for 25 CropZones for 1 year", start: "2025-06-17", expiry: "2026-06-17", plan: "Some Plan", billing: "Self Pay", status: "Active" },
  { product: "Weather Forecast", start: "2025-10-27", expiry: "2026-10-27", plan: "Some Plan", billing: "Self Pay", status: "Active" },
];

// Mock user billing settings
const userBillingProfile = {
  billName: "Example Customer",
  billEmail: "billing@example.com",
  billAddress: "Main Street 1, City, 12345",
  billCountry: "Austria",
  billVat: "",
  billMethod: "Self Pay"
};

let manageIndex = null;
let wizardStep = 1;
let selectedType = null;

// Grid
const grid = document.getElementById("grid");
const refreshBtn = document.getElementById("refreshBtn");
const newBtn = document.getElementById("newBtn");

// Manage modal refs
const manageModalEl = document.getElementById("manageModal");
const manageModal = manageModalEl ? new bootstrap.Modal(manageModalEl) : null;

const mProduct = document.getElementById("mProduct");
const mPlan = document.getElementById("mPlan");
const mBilling = document.getElementById("mBilling");
const mStart = document.getElementById("mStart");
const mExpiry = document.getElementById("mExpiry");
const mStatus = document.getElementById("mStatus");
const mRenew = document.getElementById("mRenew");
const mUpgrade = document.getElementById("mUpgrade");
const mCancel = document.getElementById("mCancel");
const mDelete = document.getElementById("mDelete");
const mSave = document.getElementById("mSave");

// Wizard refs
const wizardEl = document.getElementById("addWizardModal");
const wizard = wizardEl ? new bootstrap.Modal(wizardEl) : null;

const stepEls = [1,2,3,4].map(n => document.getElementById(`step${n}`));
const chipEls = [1,2,3,4].map(n => document.getElementById(`chip${n}`));

const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const payBtn = document.getElementById("payBtn");
const wizardHint = document.getElementById("wizardHint");

const apiTier = document.getElementById("apiTier");
const apiStart = document.getElementById("apiStart");
const apiEnd = document.getElementById("apiEnd");
const estCost = document.getElementById("estCost");
const estNote = document.getElementById("estNote");

const billName = document.getElementById("billName");
const billEmail = document.getElementById("billEmail");
const billAddress = document.getElementById("billAddress");
const billCountry = document.getElementById("billCountry");
const billVat = document.getElementById("billVat");
const billMethod = document.getElementById("billMethod");
const billingGate = document.getElementById("billingGate");

// Summary refs
const sumType = document.getElementById("sumType");
const sumDevices = document.getElementById("sumDevices");
const sumTier = document.getElementById("sumTier");
const sumDates = document.getElementById("sumDates");
const sumBilling = document.getElementById("sumBilling");
const sumCost = document.getElementById("sumCost");

function selectableCards() { return Array.from(document.querySelectorAll(".selectable")); }
function deviceChecks() { return Array.from(document.querySelectorAll(".device-check")); }

// --------- GRID ---------
function render() {
  if (!grid) return;
  grid.innerHTML = seed.map((row, idx) => {
    const badgeClass = row.status === "Active" ? "text-bg-success"
                    : row.status === "Pending" ? "text-bg-warning"
                    : row.status === "Cancelled" ? "text-bg-danger"
                    : "text-bg-secondary";
    const isClientAPI = row.product && row.product.includes('Client API');
    return `
      <tr>
        <td>
          <div class="fw-semibold">${escapeHtml(row.product)}</div>
          <div class="mt-1 d-flex gap-2 align-items-center flex-wrap">
            <span class="badge ${badgeClass}">${escapeHtml(row.status)}</span>
            <span class="text-secondary small">${escapeHtml(row.plan)} • ${escapeHtml(row.billing)}</span>
          </div>
        </td>
        <td>${escapeHtml(row.start)}</td>
        <td>${escapeHtml(row.expiry)}</td>
        <td class="text-end">
          <button class="btn btn-primary btn-sm" type="button" data-action="details" data-idx="${idx}" ${!isClientAPI ? 'disabled' : ''}>MANAGE</button>
        </td>
      </tr>
    `;
  }).join("");
}

grid?.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action='details']");
  if (!btn) return;
  const idx = Number(btn.getAttribute("data-idx"));
  if (Number.isFinite(idx)) openManage(idx);
});

// --------- MANAGE ---------
function openManage(idx) {
  // ensure subscription exists
  const row = (typeof seed !== 'undefined' ? seed[idx] : null);
  if (!row) return;

  // keep index for save/delete handlers
  manageIndex = idx;

  // initialize manageWizard so manageRenderStep can find the subscription
  manageWizard = manageWizard || { step: 1, mode: null, subId: null, selection: {} };
  manageWizard.subId = idx;            // store index (findSubscription will handle index)
  manageWizard.step = 1;
  manageWizard.mode = null;
  manageWizard.selection = {};

  // populate simple legacy fields if they exist (safe lookups)
  const mProductEl = document.getElementById('mProduct');
  const mPlanEl = document.getElementById('mPlan');
  const mBillingEl = document.getElementById('mBilling');
  const mStartEl = document.getElementById('mStart');
  const mExpiryEl = document.getElementById('mExpiry');
  const mStatusEl = document.getElementById('mStatus');

  if (mProductEl) mProductEl.value = row.product || '';
  if (mPlanEl) mPlanEl.value = row.plan || row.tier || '';
  if (mBillingEl) mBillingEl.value = row.billing || '';
  if (mStartEl) mStartEl.value = row.start || row.startDate || '';
  if (mExpiryEl) mExpiryEl.value = row.expiry || row.end || row.endDate || '';
  if (mStatusEl) mStatusEl.value = row.status || '';

  // render wizard content for this subscription
  try { manageRenderStep(); } catch (e) { console.warn('manageRenderStep failed', e); }

  // show/manage modal safely
  try {
    manageModal?.show();
  } catch (e) {
    const el = document.getElementById('manageModal');
    if (el) bootstrap.Modal.getOrCreateInstance(el).show();
  }
}
function saveManage() {
  if (manageIndex === null) return;
  seed[manageIndex] = {
    product: seed[manageIndex].product,
    plan: mPlan.value,
    billing: mBilling.value,
    start: mStart.value,
    expiry: mExpiry.value,
    status: mStatus.value
  };
  render();
  manageModal?.hide();
}
function renewManage() {
  const d = new Date(mExpiry.value + "T00:00:00");
  if (isNaN(d.getTime())) return;
  mExpiry.value = isoDate(addYears(d, 1));
  mStatus.value = "Active";
}
function upgradeManage(){ mPlan.value = bumpTier(mPlan.value); }
function cancelManage(){ mStatus.value = "Cancelled"; }
function deleteManage(){
  if (manageIndex === null) return;
  const ok = confirm("Delete this subscription entry? (demo only)");
  if (!ok) return;
  seed.splice(manageIndex, 1);
  manageIndex = null;
  render();
  manageModal?.hide();
}
mSave?.addEventListener("click", saveManage);
mRenew?.addEventListener("click", renewManage);
mUpgrade?.addEventListener("click", upgradeManage);
mCancel?.addEventListener("click", cancelManage);
mDelete?.addEventListener("click", deleteManage);

// --------- WIZARD ---------
function openWizard() {
  resetWizard();
  preloadBillingFromSettings();
  wizard?.show();
}

function resetWizard() {
  wizardStep = 1;
  selectedType = null;

  selectableCards().forEach(c => c.classList.remove("selected"));
  deviceChecks().forEach(ch => ch.checked = false);

  const today = new Date();
  apiStart.value = isoDate(today);
  apiEnd.value = isoDate(addYears(today, 1));
  apiTier.value = "Tier 2";
  updateEstimate();

  setStep(1);
}

function setStep(n) {
  wizardStep = n;

  stepEls.forEach((el, idx) => el.classList.toggle("d-none", idx+1 !== wizardStep));
  chipEls.forEach(c => c.classList.remove("active"));
  chipEls[wizardStep-1].classList.add("active");

  backBtn.disabled = wizardStep === 1;
  nextBtn.classList.toggle("d-none", wizardStep === 4);
  payBtn.classList.toggle("d-none", wizardStep !== 4);

  wizardHint.textContent = hintForStep(wizardStep);
  updateNextState();
}

function hintForStep(n) {
  if (n === 1) return "Choose what you want to subscribe to.";
  if (n === 2) return "Select devices, tier, and subscription dates.";
  if (n === 3) return "Confirm billing profile before payment.";
  if (n === 4) return "Review summary and complete payment.";
  return "";
}

function updateNextState() {
  if (wizardStep === 1) {
    nextBtn.disabled = !selectedType;
    return;
  }
  if (wizardStep === 2) {
    const devs = selectedDevices();
    const datesOk = apiStart.value && apiEnd.value && apiStart.value <= apiEnd.value;
    nextBtn.disabled = !(selectedType === "API" && devs.length > 0 && datesOk);
    return;
  }
  if (wizardStep === 3) {
    const ok = billingComplete();
    billingGate.classList.toggle("d-none", ok);
    nextBtn.disabled = !ok;
    return;
  }
  nextBtn.disabled = false;
}

function selectedDevices() {
  return deviceChecks().filter(ch => ch.checked).map(ch => ch.value);
}

function preloadBillingFromSettings() {
  billName.value = userBillingProfile.billName || "";
  billEmail.value = userBillingProfile.billEmail || "";
  billAddress.value = userBillingProfile.billAddress || "";
  billCountry.value = userBillingProfile.billCountry || "";
  billVat.value = userBillingProfile.billVat || "";
  billMethod.value = userBillingProfile.billMethod || "Self Pay";
}

function billingComplete() {
  // If we're in manage wizard, check the subscription's stored billing profile
  if (manageWizard && manageWizard.step === 3) {
    const sub = findSubscription(manageWizard.subId);
    if (!sub) return false;
    const subBilling = sub.billingProfile || userBillingProfile;
    const required = [subBilling.billName, subBilling.billEmail, subBilling.billAddress, subBilling.billCountry];
    return required.every(v => (v || "").trim().length > 0);
  }
  
  // Otherwise check the wizard form fields
  const required = [billName.value, billEmail.value, billAddress.value, billCountry.value];
  return required.every(v => (v || "").trim().length > 0);
}

function updateEstimate() {
  const devCount = selectedDevices().length;
  if (!devCount) {
    estCost.textContent = "€—";
    estNote.textContent = "Select devices to see an estimate.";
    return;
  }

  // Use computeCost() so tier + per-device pricing is consistent
  const { tierPrice, devices, devicePrice, total } = computeCost();

  estCost.textContent = `€${total}`;
  estNote.textContent = `€${tierPrice} (tier-price/year) + ${devices} × €${devicePrice} (per-device-price/year) = €${total}`;
}

function buildSummary() {
  const devs = selectedDevices();
  const tier = apiTier.value;
  const start = apiStart.value;
  const end = apiEnd.value;

  // Use computeCost() to derive the current estimate
  const { tierPrice, devices: devCount, devicePrice, total } = computeCost();
  
  sumType.textContent = selectedType || "—";
  sumDevices.textContent = devs.length ? devs.join(", ") : "—";
  sumTier.textContent = tier || "—";
  sumDates.textContent = (start && end) ? `${start} → ${end}` : "—";
  sumBilling.textContent = billMethod.value || "—";
  sumCost.textContent = devs.length ? `€${total}` : "€—";

  return { devs, tier, start, end, cost: total, billing: billMethod.value };
}

function completePayment() {
  const { devs, tier, start, end, billing, cost } = buildSummary();
  
  const status = (billing === "Self Pay") ? "Active" : "Pending";

  seed.push({
    product: `Client API (${devs.length} device${devs.length === 1 ? "" : "s"})`,
    start,
    expiry: end,
    plan: tier,
    billing,
    status,
    devices: devs,
    billingProfile: {
      billName: billName.value,
      billEmail: billEmail.value,
      billAddress: billAddress.value,
      billCountry: billCountry.value,
      billVat: billVat.value,
      billMethod: billMethod.value
    }
  });

  render();
  wizard?.hide();
}

// Tier prices (annual) and per-device price (annual)
const TIER_PRICES = {
  'Tier 1': 49,
  'Tier 2': 249,
  'Tier 3': 499
};
const DEVICE_PRICE = 30; // € per device annually

function computeCost() {
  const tierSelect = document.getElementById('apiTier');
  let tierPrice = 0;

  if (tierSelect) {
    const selectedText = (tierSelect.options[tierSelect.selectedIndex]?.text || tierSelect.value || '').toString();

    // Try to find a known tier key inside the visible text or the select value (handles "Tier 2 (500...)" labels)
    const matchedKey = Object.keys(TIER_PRICES).find(k => selectedText.includes(k));
    if (matchedKey) {
      tierPrice = TIER_PRICES[matchedKey];
    } else if (TIER_PRICES.hasOwnProperty(tierSelect.value)) {
      tierPrice = TIER_PRICES[tierSelect.value];
    } else {
      tierPrice = Number(tierSelect.value) || 0;
    }
  }

  // Count selected device checkboxes (uses existing helper)
  const devices = selectedDevices().length;

  const total = tierPrice + (devices * DEVICE_PRICE);

  return {
    tierPrice,
    devices,
    devicePrice: DEVICE_PRICE,
    total
  };
}

// Type selection
document.addEventListener("click", (e) => {
  const card = e.target.closest(".selectable");
  if (!card) return;
  const subtype = card.getAttribute("data-subtype");
  selectableCards().forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
  selectedType = subtype; // API/Webhooks/SMS
  
  // CHECK FOR DUPLICATE CLIENT API AFTER STEP 1 SELECTION
  if (selectedType === "API") {
    const hasClientAPI = seed.some(s => s.product && s.product.includes('Client API'));
    if (hasClientAPI) {
      alert('A Client API subscription already exists. Please choose a different product.');
      selectedType = null;
      card.classList.remove("selected");
      updateNextState();
      return;
    }
  }
  
  updateNextState();
});

// Wizard nav
backBtn?.addEventListener("click", () => { if (wizardStep > 1) setStep(wizardStep - 1); });
nextBtn?.addEventListener("click", () => {
  if (wizardStep === 1) { if (!selectedType) return; setStep(2); return; }
  if (wizardStep === 2) { setStep(3); return; }
  if (wizardStep === 3) { if (!billingComplete()) return; buildSummary(); setStep(4); return; }
});
payBtn?.addEventListener("click", completePayment);

// Gating & estimate updates
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("device-check") || e.target.id === "apiTier") {
    updateEstimate(); updateNextState();
  }
  if (e.target.id === "apiStart" || e.target.id === "apiEnd") updateNextState();
  if (["billName","billEmail","billAddress","billCountry","billMethod","billVat"].includes(e.target.id)) updateNextState();
});
document.addEventListener("input", (e) => {
  if (["billName","billEmail","billAddress","billCountry"].includes(e.target.id)) updateNextState();
});

// Page buttons
newBtn?.addEventListener("click", openWizard);
refreshBtn?.addEventListener("click", render);

// --- Manage modal wizard state & helpers ---
let manageWizard = {
  step: 1,
  mode: null,      // 'add-devices' or 'upgrade-tier'
  subId: null,
  selection: {}    // temporary selections (devices/newTier)
};

//const manageModalEl = document.getElementById('manageModal');
const manageBackBtn = document.getElementById('manageBackBtn');
const manageNextBtn = document.getElementById('manageNextBtn');
const managePayBtn = document.getElementById('managePayBtn');

function findSubscription(id) {
  if (id === null || typeof id === 'undefined') return null;
  // numeric index -> direct access
  const n = Number(id);
  if (!Number.isNaN(n) && Number.isInteger(n) && n >= 0 && n < seed.length) {
    return seed[n];
  }
  // fallback: search by id property if present
  return (Array.isArray(seed) ? seed.find(s => String(s.id) === String(id)) : null) || null;
}

function daysBetween(a, b) {
  const A = new Date(a), B = new Date(b);
  const ms = B - A;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function remainingDaysForSub(sub) {
  try {
    const today = new Date();
    const expiry = new Date(sub.expiry || sub.end || sub.expiryDate || sub.endDate);
    return Math.max(0, Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)));
  } catch (e) { return 0; }
}

function prorataFractionForSub(sub) {
  const rem = remainingDaysForSub(sub);
  // use 365-day year for proration
  return Math.max(0, Math.min(1, rem / 365));
}

// remove renew event hookup if present to satisfy requirement (no renew +1 year)
try { mRenew?.removeEventListener?.("click", renewManage); } catch (e) { /* ignore */ }

// Open manage wizard. mode: 'add-devices' | 'upgrade-tier'
function openManageWizard(subId, mode) {
  manageWizard.step = 1;
  manageWizard.mode = mode;
  manageWizard.subId = subId;
  manageWizard.selection = {};
  // show modal
  const modal = new bootstrap.Modal(manageModalEl);
  modal.show();
  manageRenderStep();
}

function manageRenderStep() {
  const sub = findSubscription(manageWizard.subId);

  if (!sub) {
    console.error('manageRenderStep: subscription not found for id', manageWizard.subId);
    const ov = document.getElementById('manageOverview');
    if (ov) ov.innerHTML = '<div class="alert alert-warning">Subscription not found.</div>';
    return;
  }

  // Update stepchip styling (matching Add Subscription wizard)
  [1, 2, 3, 4].forEach(n => {
    const chip = document.getElementById(`manageChip${n}`);
    if (!chip) return;
    const isActive = n === manageWizard.step;
    const isDone = n < manageWizard.step;
    chip.classList.toggle('active', isActive || isDone);
  });

  // Show/hide steps
  [1, 2, 3, 4].forEach(n => {
    const el = document.getElementById(`manage-step-${n}`);
    if (el) el.classList.toggle('d-none', n !== manageWizard.step);
  });

  // Hints
  const hints = {
    1: 'Review subscription and choose an action.',
    2: manageWizard.mode === 'add-devices' ? 'Select devices to add.' : manageWizard.mode === 'upgrade-tier' ? 'Choose new tier.' : 'Review API quota usage for today.',
    3: 'Confirm billing details before payment.',
    4: 'Review changes and complete payment.'
  };
  const hintEl = document.getElementById('manageHint');
  if (hintEl) hintEl.textContent = hints[manageWizard.step] || '';

  // STEP 1: Overview
  if (manageWizard.step === 1) {
    const ov = document.getElementById('manageOverview');
    if (!ov) return;
    
    ov.innerHTML = `
      <h6 class="fw-bold mb-3">Subscription overview</h6>
      <div class="row mb-4">
        <div class="col-6">
          <div class="mb-3">
            <div class="text-secondary small">Product</div>
            <div class="fw-semibold">${sub.product || 'Client API'}</div>
          </div>
          <div class="mb-3">
            <div class="text-secondary small">Plan / Tier</div>
            <div class="fw-semibold">${sub.plan || '—'}</div>
          </div>
          <div>
            <div class="text-secondary small">Devices</div>
            <div class="fw-semibold">${(sub.devices && sub.devices.length) ? sub.devices.join(', ') : '—'}</div>
          </div>
        </div>
        <div class="col-6">
          <div class="mb-3">
            <div class="text-secondary small">Start date</div>
            <div class="fw-semibold">${sub.start || '—'}</div>
          </div>
          <div class="mb-3">
            <div class="text-secondary small">Expiry date</div>
            <div class="fw-semibold">${sub.expiry || '—'}</div>
          </div>
          <div>
            <div class="text-secondary small">Status</div>
            <div><span class="badge ${sub.status === 'Active' ? 'text-bg-success' : sub.status === 'Pending' ? 'text-bg-warning' : 'text-bg-secondary'}">${sub.status || '—'}</span></div>
          </div>
        </div>
      </div>
      <div class="d-flex gap-2 pt-2 border-top">
        <button type="button" class="btn btn-outline-primary btn-sm flex-grow-1" id="manageActionAdd">Add devices</button>
        <button type="button" class="btn btn-outline-primary btn-sm flex-grow-1" id="manageActionUpgrade">Upgrade tier</button>
        <button type="button" class="btn btn-outline-info btn-sm flex-grow-1" id="manageActionQuota">Check Quota</button>
        <button type="button" class="btn btn-outline-danger btn-sm" id="manageActionDelete">Delete</button>
      </div>
    `;
    
    const addBtn = document.getElementById('manageActionAdd');
    const upBtn = document.getElementById('manageActionUpgrade');
    const quotaBtn = document.getElementById('manageActionQuota');
    const delBtn = document.getElementById('manageActionDelete');
    if (addBtn) addBtn.onclick = () => { manageWizard.mode = 'add-devices'; manageWizard.step = 2; manageRenderStep(); };
    if (upBtn) upBtn.onclick = () => { manageWizard.mode = 'upgrade-tier'; manageWizard.step = 2; manageRenderStep(); };
    if (quotaBtn) quotaBtn.onclick = () => { manageWizard.mode = 'check-quota'; manageWizard.step = 2; manageRenderStep(); };
    if (delBtn) delBtn.onclick = () => {
      const ok = confirm(`Delete subscription "${sub.product}"? (demo only)`);
      if (ok) {
        seed.splice(manageWizard.subId, 1);
        bootstrap.Modal.getInstance(manageModalEl)?.hide();
        render();
      }
    };
    
    // Hide Back and Next buttons on step 1
    manageBackBtn.classList.add('d-none');
    manageNextBtn.classList.add('d-none');
  }

  // STEP 2: Action (Add devices OR Upgrade tier OR Check Quota)
  if (manageWizard.step === 2) {
    const content = document.getElementById('manageActionContent');
    if (!content) return;
    
    content.innerHTML = '';
    
    if (manageWizard.mode === 'check-quota') {
      // Show Back button only for Quota view (no Next button)
      manageBackBtn.classList.remove('d-none');
      manageNextBtn.classList.add('d-none');
      managePayBtn.classList.add('d-none');
      
      const tier = sub.plan || 'Tier 2';
      const maxCallsPerDay = TIER_PRICES[tier] ? (tier === 'Tier 1' ? 48 : tier === 'Tier 2' ? 500 : 1500) : 500;
      const devices = sub.devices || [];
      
      content.innerHTML = `
        <h6 class="fw-bold mb-3">API Quota Usage</h6>
        <div class="text-secondary small mb-3">Current usage for today (${isoDate(new Date())})</div>
        <div id="quotaList" class="border rounded-3 p-3"></div>
      `;
      
      const quotaList = document.getElementById('quotaList');
      if (quotaList) {
        devices.forEach(device => {
          // Demo: random usage between 0 and 80% of max
          const used = Math.floor(Math.random() * (maxCallsPerDay * 0.8));
          const percentage = Math.round((used / maxCallsPerDay) * 100);
          const progressBarClass = percentage > 80 ? 'bg-danger' : percentage > 50 ? 'bg-warning' : 'bg-success';
          
          const row = document.createElement('div');
          row.className = 'mb-3 pb-3 border-bottom';
          row.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="fw-semibold">${device}</div>
              <div class="small text-secondary">${used} / ${maxCallsPerDay}</div>
            </div>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar ${progressBarClass}" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="small text-secondary mt-1">${percentage}% of daily limit used</div>
          `;
          quotaList.appendChild(row);
        });
      }
    } else {
      // Show Back and Next buttons on step 2 (for add-devices and upgrade-tier)
      manageBackBtn.classList.remove('d-none');
      manageNextBtn.classList.remove('d-none');
      managePayBtn.classList.add('d-none');

      if (manageWizard.mode === 'add-devices') {
        content.innerHTML = `
          <h6 class="fw-bold mb-2">Select devices to add</h6>
          <div class="row g-3">
            <div class="col-12">
              <div class="border rounded-3 p-2">
                <div id="manageDevicesList"></div>
              </div>
              <div class="form-text">Select devices to add to this subscription (pro-rated for remaining term).</div>
            </div>
            <div class="col-12">
              <div class="border rounded-3 p-3 bg-body-tertiary">
                <div id="manageDevicesEstimate" class="text-secondary small"></div>
              </div>
            </div>
          </div>
        `;
        const listEl = document.getElementById('manageDevicesList');
        if (!listEl) return;
        
        const existing = sub.devices || [];
        const checks = document.querySelectorAll('#step2 input[type="checkbox"]');
        checks.forEach(ch => {
          const isExisting = existing.includes(ch.value);
          const div = document.createElement('div');
          div.className = 'form-check';
          div.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${ch.value}" id="manageDev_${ch.value}" ${isExisting ? 'checked disabled' : ''}>
            <label class="form-check-label" for="manageDev_${ch.value}" style="${isExisting ? 'opacity:0.6;' : ''}">${ch.nextElementSibling?.textContent?.trim() || ch.value}</label>
          `;
          listEl.appendChild(div);
        });
        
        listEl.querySelectorAll('input[type="checkbox"]:not([disabled])').forEach(ch => {
          ch.addEventListener('change', updateManageDevicesEstimate);
        });
        updateManageDevicesEstimate();
      } else if (manageWizard.mode === 'upgrade-tier') {
        content.innerHTML = `
          <h6 class="fw-bold mb-2">Select new tier</h6>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label for="manageNewTier" class="form-label fw-semibold">Tier</label>
              <select id="manageNewTier" class="form-select"></select>
            </div>
            <div class="col-12">
              <div class="border rounded-3 p-3 bg-body-tertiary">
                <div id="manageUpgradeEstimate" class="text-secondary small"></div>
              </div>
            </div>
          </div>
        `;
        const sel = document.getElementById('manageNewTier');
        if (!sel) return;
        
        const currentTier = sub.plan || '';
        Object.keys(TIER_PRICES).forEach(tier => {
          const opt = document.createElement('option');
          opt.value = tier;
          opt.textContent = `${tier} (${TIER_PRICES[tier]} calls/day/device)`;
          opt.selected = (tier === currentTier);
          sel.appendChild(opt);
        });
        sel.addEventListener('change', updateManageUpgradeEstimate);
        updateManageUpgradeEstimate();
      }
    }
  }

  // STEP 3: Billing (only for add-devices and upgrade-tier)
  if (manageWizard.step === 3) {
    // Skip step 3 entirely for check-quota mode
    if (manageWizard.mode === 'check-quota') {
      manageWizard.step = 1;
      manageRenderStep();
      return;
    }

    const info = document.getElementById('manageBillingInfo');
    const val = document.getElementById('manageBillingValidation');
    
    // Show Back and Next buttons on step 3
    manageBackBtn.classList.remove('d-none');
    manageNextBtn.classList.remove('d-none');
    managePayBtn.classList.add('d-none');
    
    // Preload billing details from subscription's stored billing profile
    const subBilling = sub.billingProfile || userBillingProfile;
    
    if (info) {
      info.innerHTML = `
        <div class="text-secondary small mb-3">Billing profile used when this subscription was created. Review and confirm.</div>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Billing name</label>
            <input class="form-control" value="${subBilling.billName || '—'}" disabled />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Billing email</label>
            <input class="form-control" value="${subBilling.billEmail || '—'}" disabled />
          </div>
          <div class="col-12">
            <label class="form-label fw-semibold">Address</label>
            <input class="form-control" value="${subBilling.billAddress || '—'}" disabled />
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label fw-semibold">Country</label>
            <input class="form-control" value="${subBilling.billCountry || '—'}" disabled />
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label fw-semibold">VAT ID</label>
            <input class="form-control" value="${subBilling.billVat || '—'}" disabled />
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label fw-semibold">Billing method</label>
            <input class="form-control" value="${subBilling.billMethod || '—'}" disabled />
          </div>
        </div>
      `;
    }
    
    const complete = billingComplete();
    if (val) {
      if (!complete) {
        val.textContent = 'Current billing profile incomplete. Please update billing settings first.';
        val.classList.remove('d-none');
        manageNextBtn.disabled = true;
      } else {
        val.classList.add('d-none');
        manageNextBtn.disabled = false;
      }
    }
  }

  // STEP 4: Summary (only for add-devices and upgrade-tier)
  if (manageWizard.step === 4) {
    // Skip step 4 entirely for check-quota mode
    if (manageWizard.mode === 'check-quota') {
      manageWizard.step = 1;
      manageRenderStep();
      return;
    }

    const sum = document.getElementById('manageSummary');
    if (!sum) return;
    
    // Show Back button, hide Next button on step 4
    manageBackBtn.classList.remove('d-none');
    manageNextBtn.classList.add('d-none');
    
    let html = '<div class="border rounded-3 p-3">';
    let amount = 0;

    if (manageWizard.mode === 'add-devices') {
      const checks = Array.from(document.querySelectorAll('#manageDevicesList input[type="checkbox"]:not([disabled])'));
      const added = checks.filter(ch => ch.checked).map(ch => ch.value);
      manageWizard.selection.addDevices = added;
      const fr = prorataFractionForSub(sub);
      amount = added.length * DEVICE_PRICE * fr;
      
      html += `
        <div class="row g-2 small">
          <div class="col-4 text-secondary">Action</div><div class="col-8 fw-semibold">Add ${added.length} device(s)</div>
          <div class="col-4 text-secondary">Cost/device</div><div class="col-8">€${DEVICE_PRICE}</div>
          <div class="col-4 text-secondary">Proration</div><div class="col-8">${fr.toFixed(2)} remaining</div>
          <div class="col-4 text-secondary">Total</div><div class="col-8 fw-bold">€${amount.toFixed(2)}</div>
        </div>
      `;
    } else if (manageWizard.mode === 'upgrade-tier') {
      const newTier = document.getElementById('manageNewTier')?.value;
      manageWizard.selection.newTier = newTier;
      const oldPrice = TIER_PRICES[sub.plan] || 0;
      const newPrice = TIER_PRICES[newTier] || 0;
      const diff = Math.max(0, newPrice - oldPrice);
      const fr = prorataFractionForSub(sub);
      amount = diff * fr;
      
      html += `
        <div class="row g-2 small">
          <div class="col-4 text-secondary">Action</div><div class="col-8 fw-semibold">Upgrade tier</div>
          <div class="col-4 text-secondary">Current</div><div class="col-8">${sub.plan}</div>
          <div class="col-4 text-secondary">New</div><div class="col-8">${newTier}</div>
          <div class="col-4 text-secondary">Proration</div><div class="col-8">${fr.toFixed(2)} remaining</div>
          <div class="col-4 text-secondary">Total</div><div class="col-8 fw-bold">€${amount.toFixed(2)}</div>
        </div>
      `;
    }
    html += '</div>';
    sum.innerHTML = html;
    manageWizard.selection.amountDue = amount;
    
    // Show Pay button if amount > 0 (billing was already validated in step 3)
    const showPay = amount > 0;
    managePayBtn.classList.toggle('d-none', !showPay);
  }

  // Back button disabled state
  manageBackBtn.disabled = (manageWizard.step === 1);
}

// estimate update helpers
function updateManageDevicesEstimate() {
  const checks = Array.from(document.querySelectorAll('#manageDevicesList input[type="checkbox"]:not([disabled])'));
  const selected = checks.filter(ch => ch.checked).length;
  const sub = findSubscription(manageWizard.subId);
  if (!sub) return;
  
  const fr = prorataFractionForSub(sub);
  const remainingDays = remainingDaysForSub(sub);
  const cost = selected * DEVICE_PRICE * fr;
  const est = document.getElementById('manageDevicesEstimate');
  if (est) est.textContent = `Prorated for remaining subscription: €${DEVICE_PRICE}/device/yr × ${selected} devices × ${fr.toFixed(3)} (for remaining ${remainingDays} days) = €${cost.toFixed(2)}`;
}

function updateManageUpgradeEstimate() {
  const sub = findSubscription(manageWizard.subId);
  const sel = document.getElementById('manageNewTier');
  if (!sel) return;
  const newTier = sel.value;
  const curTier = sub.plan || sub.tier || '';
  let diff = 0;
  if (newTier && curTier && newTier !== curTier) {
    diff = Math.max(0, (TIER_PRICES[newTier] || 0) - (TIER_PRICES[curTier] || 0));
  }
  const fr = prorataFractionForSub(sub);
  const cost = diff * fr;
  document.getElementById('manageUpgradeEstimate').textContent = `Pro‑rata upgrade: €${diff.toFixed(2)} × ${fr.toFixed(3)} = €${cost.toFixed(2)} (remaining term)`;
}

// navigation handlers
manageBackBtn?.addEventListener('click', () => {
  if (manageWizard.step > 1) {
    manageWizard.step -= 1;
    manageRenderStep();
  }
});
manageNextBtn?.addEventListener('click', () => {
  if (manageWizard.step < 4) {
    // step-specific validation: next from devices should ensure at least one selected for add-devices
    if (manageWizard.step === 2 && manageWizard.mode === 'add-devices') {
      const any = Array.from(document.querySelectorAll('#manageDevicesList input[type="checkbox"]:not([disabled])')).some(ch => ch.checked);
      if (!any) { alert('Select one or more devices to add.'); return; }
    }
    if (manageWizard.step === 3 && manageWizard.mode === 'upgrade-tier') {
      // it's okay to proceed even if tier unchanged; payment will be €0 and Pay button hidden
    }
    manageWizard.step += 1;
    manageRenderStep();
  }
});

// Pay & Update
managePayBtn?.addEventListener('click', () => {
  const sub = findSubscription(manageWizard.subId);
  if (!sub) return;
  const amount = manageWizard.selection.amountDue || 0;
  // simulate payment success
  // apply changes
  if (manageWizard.mode === 'add-devices') {
    const toAdd = manageWizard.selection.addDevices || [];
    sub.devices = Array.from(new Set([...(sub.devices || []), ...toAdd]));
    // update cost stored on subscription if you store it
    sub.cost = (sub.cost || 0) + amount;
  } else if (manageWizard.mode === 'upgrade-tier') {
    const newTier = manageWizard.selection.newTier;
    if (newTier && newTier !== (sub.plan || sub.tier)) {
      sub.plan = newTier;
      sub.cost = (sub.cost || 0) + amount;
    }
  }
  // persist/save if you have persistence (localStorage) or call your existing save routine
  if (typeof saveSubscriptions === 'function') {
    saveSubscriptions();
  } else {
    // fallback: if seed exists, write to localStorage
    try {
      const list = typeof seed !== 'undefined' ? seed : [];
      localStorage.setItem('subscriptions', JSON.stringify(list));
    } catch (e) { /* ignore */ }
  }
  // close and re-render UI
  bootstrap.Modal.getInstance(manageModalEl)?.hide();
  render();
});

// Expose helper to open manage wizard (wire existing manage row "DETAILS" buttons to call this)
function openManageAddDevices(subId) { openManageWizard(subId, 'add-devices'); }
function openManageUpgradeTier(subId) { openManageWizard(subId, 'upgrade-tier'); }

// Helpers
function bumpTier(cur) {
  const order = ["Tier 1","Tier 2","Tier 3"];
  const i = order.indexOf(cur);
  if (i >= 0 && i < order.length - 1) return order[i+1];
  return cur;
}
function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addYears(d, n) {
  const copy = new Date(d.getTime());
  copy.setFullYear(copy.getFullYear() + n);
  return copy;
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

// Init
render();