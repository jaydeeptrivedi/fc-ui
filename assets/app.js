// assets/app.js
const seed = [
  { product: "Client API", start: "2025-12-17", expiry: "2026-12-17", plan: "Tier 1", billing: "Self Pay", status: "Active", devices: ["device001", "device002"], billingProfile: { billName: "Example Customer", billEmail: "billing@example.com", billAddress: "Main Street 1, City, 12345", billCountry: "Austria", billVat: "", billMethod: "Self Pay" } },
  { product: "Disease Models - Apple (2 licenses)", start: "2025-12-17", expiry: "2026-12-17", plan: "DM License", billing: "Self Pay", status: "Active", devices: ["device001", "device003"], crop: "apple", cropName: "Apple", billingProfile: { billName: "Example Customer", billEmail: "billing@example.com", billAddress: "Main Street 1, City, 12345", billCountry: "Austria", billVat: "", billMethod: "Self Pay" }, cost: 192 },
  { product: "FarmView with Satellite for 25 CropZones for 1 year", start: "2025-06-17", expiry: "2026-06-17", plan: "Some Plan", billing: "Self Pay", status: "Active" },
  { product: "Weather Forecast", start: "2025-10-27", expiry: "2026-10-27", plan: "Some Plan", billing: "Self Pay", status: "Active" },
];

// =============================================
// DISEASE MODELS CONFIGURATION
// =============================================

// Crops/Fruits with required sensors for disease model calculation
const DM_CROPS = {
  'apple': {
    name: 'Apple',
    requiredSensors: ['temperature', 'humidity'],  // Minimum for any model
    description: 'Apple Scab, Fire Blight, Powdery Mildew',
    models: [
      { id: 'aphid_risk', name: 'Aphid Risk', sensors: ['temperature', 'humidity'] },
      { id: 'rain_washoff', name: 'Rain Pesticide Wash Off', sensors: ['rainfall'] },
      { id: 'fire_blight', name: 'Fire Blight (Erwinia amylovora)', sensors: ['temperature', 'humidity', 'leaf_wetness'] },
      { id: 'scab_ascospore_maturity', name: 'Scab / Ascospore Maturity', sensors: ['temperature', 'humidity', 'leaf_wetness'] },
      { id: 'scab_ascospore_infection', name: 'Scab / Ascospore Infection', sensors: ['temperature', 'humidity', 'leaf_wetness', 'rainfall'] },
      { id: 'scab_conidia_infection', name: 'Scab / Conidia Infection', sensors: ['temperature', 'humidity', 'leaf_wetness'] },
      { id: 'codling_moth', name: 'Codling Moth', sensors: ['temperature'] },
      { id: 'chilling_portions', name: 'Chilling Portions', sensors: ['temperature'] }
    ]
  },
  'grape': {
    name: 'Grape / Vine',
    requiredSensors: ['temperature', 'humidity'],
    description: 'Downy Mildew, Powdery Mildew, Botrytis',
    models: [
      { id: 'downy_mildew', name: 'Downy Mildew', sensors: ['temperature', 'humidity', 'leaf_wetness', 'rainfall'] },
      { id: 'powdery_mildew', name: 'Powdery Mildew', sensors: ['temperature', 'humidity'] },
      { id: 'botrytis', name: 'Botrytis', sensors: ['temperature', 'humidity', 'leaf_wetness'] }
    ]
  },
  'wheat': {
    name: 'Wheat',
    requiredSensors: ['temperature', 'humidity'],
    description: 'Septoria, Rust, Fusarium',
    models: [
      { id: 'septoria', name: 'Septoria', sensors: ['temperature', 'humidity', 'rainfall'] },
      { id: 'rust', name: 'Rust', sensors: ['temperature', 'humidity'] },
      { id: 'fusarium', name: 'Fusarium', sensors: ['temperature', 'humidity'] }
    ]
  },
  'potato': {
    name: 'Potato',
    requiredSensors: ['temperature', 'humidity'],
    description: 'Late Blight, Early Blight',
    models: [
      { id: 'late_blight', name: 'Late Blight', sensors: ['temperature', 'humidity', 'leaf_wetness', 'rainfall'] },
      { id: 'early_blight', name: 'Early Blight', sensors: ['temperature', 'humidity'] }
    ]
  },
  'tomato': {
    name: 'Tomato',
    requiredSensors: ['temperature', 'humidity'],
    description: 'Late Blight, Botrytis, Bacterial Spot',
    models: [
      { id: 'late_blight', name: 'Late Blight', sensors: ['temperature', 'humidity', 'leaf_wetness'] },
      { id: 'botrytis', name: 'Botrytis', sensors: ['temperature', 'humidity', 'leaf_wetness'] },
      { id: 'bacterial_spot', name: 'Bacterial Spot', sensors: ['temperature', 'humidity', 'rainfall'] }
    ]
  },
  'corn': {
    name: 'Corn / Maize',
    requiredSensors: ['temperature', 'humidity'],
    description: 'Gray Leaf Spot, Northern Corn Leaf Blight',
    models: [
      { id: 'gray_leaf_spot', name: 'Gray Leaf Spot', sensors: ['temperature', 'humidity'] },
      { id: 'northern_leaf_blight', name: 'Northern Corn Leaf Blight', sensors: ['temperature', 'humidity'] }
    ]
  },
  'citrus': {
    name: 'Citrus',
    requiredSensors: ['temperature', 'humidity'],
    description: 'Citrus Canker, Greening, Black Spot',
    models: [
      { id: 'citrus_canker', name: 'Citrus Canker', sensors: ['temperature', 'humidity', 'leaf_wetness'] },
      { id: 'greening', name: 'Greening (HLB)', sensors: ['temperature'] },
      { id: 'black_spot', name: 'Black Spot', sensors: ['temperature', 'humidity', 'leaf_wetness', 'rainfall'] }
    ]
  },
  'strawberry': {
    name: 'Strawberry',
    requiredSensors: ['temperature', 'humidity'],
    description: 'Botrytis, Powdery Mildew, Anthracnose',
    models: [
      { id: 'botrytis', name: 'Botrytis', sensors: ['temperature', 'humidity', 'leaf_wetness'] },
      { id: 'powdery_mildew', name: 'Powdery Mildew', sensors: ['temperature', 'humidity'] },
      { id: 'anthracnose', name: 'Anthracnose', sensors: ['temperature', 'humidity', 'rainfall'] }
    ]
  }
};

// Sensor display names
const SENSOR_NAMES = {
  'temperature': 'Temperature Sensor',
  'humidity': 'Relative Humidity Sensor',
  'leaf_wetness': 'Leaf Wetness Sensor',
  'rainfall': 'Rain Gauge',
  'soil_moisture': 'Soil Moisture Sensor',
  'solar_radiation': 'Solar Radiation Sensor',
  'wind_speed': 'Wind Speed Sensor'
};

// Mock devices with their available sensors
const DM_DEVICES = [
  { id: 'device001', name: 'device001 (Station Alpha)', sensors: ['temperature', 'humidity', 'leaf_wetness', 'rainfall', 'soil_moisture'] },
  { id: 'device002', name: 'device002 (Vineyard East)', sensors: ['temperature', 'humidity', 'leaf_wetness', 'rainfall'] },
  { id: 'device003', name: 'device003 (Orchard North)', sensors: ['temperature', 'humidity', 'leaf_wetness', 'solar_radiation'] },
  { id: 'device004', name: 'device004 (Field South)', sensors: ['temperature', 'humidity'] },  // Missing leaf_wetness
  { id: 'device005', name: 'device005 (Greenhouse A)', sensors: ['temperature', 'humidity', 'leaf_wetness', 'rainfall'] }
];

// Disease Model pricing brackets (per device/license per year)
const DM_PRICING_BRACKETS = [
  { min: 1, max: 10, price: 96 },
  { min: 11, max: 20, price: 82 },
  { min: 21, max: 50, price: 72 },
  { min: 51, max: 100, price: 67 },
  { min: 101, max: Infinity, price: 60 }
];

// Get price per license based on total license count
function getDMPricePerLicense(licenseCount) {
  const bracket = DM_PRICING_BRACKETS.find(b => licenseCount >= b.min && licenseCount <= b.max);
  return bracket ? bracket.price : DM_PRICING_BRACKETS[DM_PRICING_BRACKETS.length - 1].price;
}

// Calculate total DM cost
function calculateDMCost(deviceCount) {
  if (deviceCount <= 0) return { pricePerLicense: 0, total: 0, bracket: null };
  const pricePerLicense = getDMPricePerLicense(deviceCount);
  return {
    pricePerLicense,
    total: pricePerLicense * deviceCount,
    bracket: DM_PRICING_BRACKETS.find(b => deviceCount >= b.min && deviceCount <= b.max)
  };
}

// Check if device has all required sensors for a crop
function deviceHasRequiredSensors(deviceId, cropId) {
  const device = DM_DEVICES.find(d => d.id === deviceId);
  const crop = DM_CROPS[cropId];
  if (!device || !crop) return { compatible: false, missing: [] };
  
  const missing = crop.requiredSensors.filter(s => !device.sensors.includes(s));
  return {
    compatible: missing.length === 0,
    missing: missing.map(s => SENSOR_NAMES[s] || s)
  };
}

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
    const isDiseaseModel = row.product && row.product.includes('Disease Models');
    const canManage = isClientAPI || isDiseaseModel;
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
          <button class="btn btn-primary btn-sm" type="button" data-action="details" data-idx="${idx}" ${!canManage ? 'disabled' : ''}>MANAGE</button>
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
  confirmAction('Delete this subscription entry?', () => {
    seed.splice(manageIndex, 1);
    manageIndex = null;
    render();
    manageModal?.hide();
  }, { title: 'Delete Subscription', confirmText: 'Delete' });
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
  currentPromoCode = null;
  currentDiscount = 0;

  selectableCards().forEach(c => c.classList.remove("selected"));
  deviceChecks().forEach(ch => ch.checked = false);

  const today = new Date();
  apiStart.value = isoDate(today);
  apiEnd.value = isoDate(addYears(today, 1));
  apiTier.value = "Tier 2";
  
  // Reset Disease Models fields
  const dmCrop = document.getElementById('dmCrop');
  const dmStart = document.getElementById('dmStart');
  const dmEnd = document.getElementById('dmEnd');
  const dmDeviceList = document.getElementById('dmDeviceList');
  const dmSensorInfo = document.getElementById('dmSensorInfo');
  
  if (dmCrop) {
    // Populate crop dropdown
    dmCrop.innerHTML = '<option value="">Select a crop...</option>';
    Object.entries(DM_CROPS).forEach(([id, crop]) => {
      dmCrop.innerHTML += `<option value="${id}">${crop.name}</option>`;
    });
    dmCrop.value = '';
  }
  if (dmStart) dmStart.value = isoDate(today);
  if (dmEnd) dmEnd.value = isoDate(addYears(today, 1));
  if (dmDeviceList) dmDeviceList.innerHTML = '<div class="text-secondary small">Select a crop first to see compatible devices.</div>';
  if (dmSensorInfo) dmSensorInfo.classList.add('d-none');
  updateDMEstimate();
  
  // Clear promo code input and messages
  const promoInput = document.getElementById('promoCode');
  const promoError = document.getElementById('promoError');
  const promoSuccess = document.getElementById('promoSuccess');
  if (promoInput) promoInput.value = '';
  if (promoError) promoError.classList.add('d-none');
  if (promoSuccess) promoSuccess.classList.add('d-none');
  
  updateEstimate();

  setStep(1);
}

function setStep(n) {
  wizardStep = n;

  // Hide all steps first
  stepEls.forEach((el, idx) => el.classList.add("d-none"));
  const step2dm = document.getElementById('step2-dm');
  if (step2dm) step2dm.classList.add('d-none');
  
  // Show the appropriate step
  if (wizardStep === 2) {
    // Show appropriate step 2 based on selected type
    if (selectedType === 'DiseaseModel') {
      if (step2dm) step2dm.classList.remove('d-none');
    } else {
      stepEls[1].classList.remove('d-none'); // step2 for API
    }
  } else {
    stepEls[wizardStep - 1].classList.remove('d-none');
  }
  
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
  if (n === 2) {
    if (selectedType === 'DiseaseModel') return "Select crop, compatible devices, and subscription dates.";
    return "Select devices, tier, and subscription dates.";
  }
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
    if (selectedType === 'DiseaseModel') {
      const dmCrop = document.getElementById('dmCrop');
      const dmDevs = selectedDMDevices();
      const dmStart = document.getElementById('dmStart');
      const dmEnd = document.getElementById('dmEnd');
      const datesOk = dmStart?.value && dmEnd?.value && dmStart.value <= dmEnd.value;
      nextBtn.disabled = !(dmCrop?.value && dmDevs.length > 0 && datesOk);
      return;
    }
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

// Disease Models device selection
function selectedDMDevices() {
  return Array.from(document.querySelectorAll('.dm-device-check:checked')).map(ch => ch.value);
}

// Get which models a device can run for a given crop
function getDeviceModelCompatibility(deviceId, cropKey) {
  const device = DM_DEVICES.find(d => d.id === deviceId);
  const crop = DM_CROPS[cropKey];
  if (!device || !crop || !crop.models) return { supported: [], unsupported: [] };
  
  const supported = [];
  const unsupported = [];
  
  crop.models.forEach(model => {
    const missing = model.sensors.filter(s => !device.sensors.includes(s));
    if (missing.length === 0) {
      supported.push(model);
    } else {
      unsupported.push({ ...model, missing });
    }
  });
  
  return { supported, unsupported };
}

function renderDMDevices(cropKey) {
  const list = document.getElementById('dmDeviceList');
  const sensorInfo = document.getElementById('dmSensorInfo');
  const requiredSensorsEl = document.getElementById('dmRequiredSensors');
  
  if (!cropKey || !DM_CROPS[cropKey]) {
    list.innerHTML = '<div class="text-secondary small">Select a crop first to see compatible devices.</div>';
    sensorInfo?.classList.add('d-none');
    return;
  }
  
  const crop = DM_CROPS[cropKey];
  
  // Show available models for this crop
  const modelNames = crop.models ? crop.models.map(m => m.name).join(', ') : crop.description;
  requiredSensorsEl.innerHTML = `<strong>Available Models:</strong> ${modelNames}`;
  sensorInfo?.classList.remove('d-none');
  
  // Render device list
  let html = '';
  DM_DEVICES.forEach(dev => {
    const { compatible } = deviceHasRequiredSensors(dev.id, cropKey);
    const { supported, unsupported } = getDeviceModelCompatibility(dev.id, cropKey);
    const totalModels = (crop.models || []).length;
    const supportedCount = supported.length;
    
    // Determine badge based on model support
    let badge = '';
    let badgeClass = '';
    if (supportedCount === totalModels) {
      badge = `All ${totalModels} models`;
      badgeClass = 'bg-success-subtle text-success';
    } else if (supportedCount > 0) {
      badge = `${supportedCount}/${totalModels} models`;
      badgeClass = 'bg-warning-subtle text-warning';
    } else {
      badge = 'No models';
      badgeClass = 'bg-danger-subtle text-danger';
    }
    
    // Build model compatibility details
    let modelDetails = '';
    if (supported.length > 0) {
      modelDetails += `<div class="small text-success mt-1"><i class="bi bi-check-circle-fill me-1"></i>${supported.map(m => m.name).join(', ')}</div>`;
    }
    if (unsupported.length > 0) {
      const unsupportedList = unsupported.map(m => `${m.name}`).join(', ');
      modelDetails += `<div class="small text-danger mt-1"><i class="bi bi-x-circle-fill me-1"></i>${unsupportedList}</div>`;
    }
    
    html += `
      <div class="form-check py-2 border-bottom ${compatible ? '' : 'opacity-50'}">
        <input class="form-check-input dm-device-check" type="checkbox" value="${dev.id}" id="dm-dev-${dev.id}" ${compatible ? '' : 'disabled'}>
        <label class="form-check-label w-100" for="dm-dev-${dev.id}">
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-medium">${dev.name}</span>
            <span class="badge ${badgeClass} small">${badge}</span>
          </div>
          <div class="small text-secondary">
            Sensors: ${dev.sensors.map(s => SENSOR_NAMES[s] || s).join(', ')}
          </div>
          ${modelDetails}
        </label>
      </div>`;
  });
  
  list.innerHTML = html || '<div class="text-secondary small">No devices available.</div>';
  
  // Attach event listeners to new checkboxes
  list.querySelectorAll('.dm-device-check').forEach(ch => {
    ch.addEventListener('change', () => {
      updateDMEstimate();
      updateNextState();
    });
  });
  
  updateDMEstimate();
}

function updateDMEstimate() {
  const dmEstCost = document.getElementById('dmEstCost');
  const dmEstNote = document.getElementById('dmEstNote');
  const devCount = selectedDMDevices().length;
  
  if (!devCount) {
    dmEstCost.textContent = '€—';
    dmEstNote.textContent = 'Select crop and devices to see an estimate.';
    return;
  }
  
  const { pricePerLicense, total } = calculateDMCost(devCount);
  
  dmEstCost.textContent = `€${total}`;
  dmEstNote.textContent = `${devCount} device${devCount > 1 ? 's' : ''} × €${pricePerLicense}/device/year = €${total}`;
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
  const sumCropLabel = document.getElementById('sumCropLabel');
  const sumCrop = document.getElementById('sumCrop');
  const sumTierLabel = document.getElementById('sumTierLabel');
  
  if (selectedType === 'DiseaseModel') {
    // Disease Models summary
    const dmCrop = document.getElementById('dmCrop');
    const dmDevs = selectedDMDevices();
    const start = document.getElementById('dmStart').value;
    const end = document.getElementById('dmEnd').value;
    const { total } = calculateDMCost(dmDevs.length);
    const cropName = dmCrop?.options[dmCrop.selectedIndex]?.text || '—';
    
    sumType.textContent = 'Disease Models';
    
    // Show crop row, hide tier row
    if (sumCropLabel) sumCropLabel.style.display = '';
    if (sumCrop) { sumCrop.style.display = ''; sumCrop.textContent = cropName; }
    if (sumTierLabel) sumTierLabel.style.display = 'none';
    sumTier.style.display = 'none';
    
    sumDevices.textContent = dmDevs.length ? dmDevs.join(', ') : '—';
    sumDates.textContent = (start && end) ? `${start} → ${end}` : '—';
    sumBilling.textContent = billMethod.value || '—';
    sumCost.textContent = dmDevs.length ? `€${total}` : '€—';
    
    return { type: 'DiseaseModel', crop: dmCrop?.value, cropName, devs: dmDevs, start, end, cost: total, billing: billMethod.value };
  }
  
  // API subscription summary (original logic)
  const devs = selectedDevices();
  const tier = apiTier.value;
  const start = apiStart.value;
  const end = apiEnd.value;

  // Use computeCost() to derive the current estimate
  const { tierPrice, devices: devCount, devicePrice, total } = computeCost();
  
  // Hide crop row, show tier row
  if (sumCropLabel) sumCropLabel.style.display = 'none';
  if (sumCrop) sumCrop.style.display = 'none';
  if (sumTierLabel) sumTierLabel.style.display = '';
  sumTier.style.display = '';
  
  sumType.textContent = selectedType || "—";
  sumDevices.textContent = devs.length ? devs.join(", ") : "—";
  sumTier.textContent = tier || "—";
  sumDates.textContent = (start && end) ? `${start} → ${end}` : "—";
  sumBilling.textContent = billMethod.value || "—";
  sumCost.textContent = devs.length ? `€${total}` : "€—";

  return { type: 'API', devs, tier, start, end, cost: total, billing: billMethod.value };
}

function completePayment() {
  const summary = buildSummary();
  const status = (summary.billing === "Self Pay") ? "Active" : "Pending";
  
  if (summary.type === 'DiseaseModel') {
    seed.push({
      product: `Disease Models - ${summary.cropName} (${summary.devs.length} license${summary.devs.length === 1 ? '' : 's'})`,
      start: summary.start,
      expiry: summary.end,
      plan: 'DM License',
      billing: summary.billing,
      status,
      devices: summary.devs,
      crop: summary.crop,
      cropName: summary.cropName,
      billingProfile: {
        billName: billName.value,
        billEmail: billEmail.value,
        billAddress: billAddress.value,
        billCountry: billCountry.value,
        billVat: billVat.value,
        billMethod: billMethod.value
      },
      cost: Math.max(0, summary.cost - (currentDiscount ? calculateDiscount(summary.cost, currentDiscount) : 0)),
      discountApplied: currentPromoCode || null
    });
  } else {
    // API subscription
    seed.push({
      product: `Client API (${summary.devs.length} device${summary.devs.length === 1 ? "" : "s"})`,
      start: summary.start,
      expiry: summary.end,
      plan: summary.tier,
      billing: summary.billing,
      status,
      devices: summary.devs,
      billingProfile: {
        billName: billName.value,
        billEmail: billEmail.value,
        billAddress: billAddress.value,
        billCountry: billCountry.value,
        billVat: billVat.value,
        billMethod: billMethod.value
      },
      cost: Math.max(0, summary.cost - (currentDiscount ? calculateDiscount(summary.cost, currentDiscount) : 0)),
      discountApplied: currentPromoCode || null
    });
  }

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

// Promo codes database with discount percentages (0-100)
const PROMO_CODES = {
  'WELCOME10': { discount: 10, description: '10% off first subscription' },
  'LAUNCH20': { discount: 20, description: '20% off all subscriptions' },
  'EARLYBIRD15': { discount: 15, description: '15% early adopter discount' },
  'SUMMER25': { discount: 25, description: '25% summer promotion' },
  'SAVE30': { discount: 30, description: '30% special offer' }
};

// Track current promo code state
let currentPromoCode = null;
let currentDiscount = 0;

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

// Promo code validation and discount functions
function validatePromoCode(code) {
  const upperCode = (code || '').trim().toUpperCase();
  if (!upperCode) {
    return { valid: false, message: 'Promo code cannot be empty.' };
  }
  if (!PROMO_CODES.hasOwnProperty(upperCode)) {
    return { valid: false, message: `Promo code "${code}" is not valid.` };
  }
  const promo = PROMO_CODES[upperCode];
  return { valid: true, code: upperCode, discount: promo.discount, description: promo.description, message: `✓ Promo code applied: ${promo.description}` };
}

function calculateDiscount(subtotal, discountPercent) {
  return (subtotal * discountPercent) / 100;
}

function updateFinalCost(wizardMode = 'add', subtotalOverride = null) {
  const promoInput = wizardMode === 'manage' ? document.getElementById('managePromoCode') : document.getElementById('promoCode');
  const errorEl = wizardMode === 'manage' ? document.getElementById('managePromoError') : document.getElementById('promoError');
  const successEl = wizardMode === 'manage' ? document.getElementById('managePromoSuccess') : document.getElementById('promoSuccess');
  const discountEl = wizardMode === 'manage' ? document.getElementById('manageDiscount') : document.getElementById('sumDiscount');
  const finalCostEl = wizardMode === 'manage' ? document.getElementById('manageFinalCost') : document.getElementById('sumFinalCost');

  let subtotal = subtotalOverride !== null ? subtotalOverride : 0;
  let discountAmount = 0;
  let finalCost = 0;

  if (subtotalOverride === null) {
    if (wizardMode === 'manage') {
      // For manage wizard, get the amount due from the summary
      subtotal = manageWizard.selection.amountDue || 0;
    } else {
      // For add wizard, get cost based on subscription type
      if (selectedType === 'DiseaseModel') {
        const dmDevs = selectedDMDevices();
        const { total } = calculateDMCost(dmDevs.length);
        subtotal = total || 0;
      } else {
        const { total } = computeCost();
        subtotal = total || 0;
      }
    }
  }

  // Calculate discount if promo code is set
  if (currentPromoCode && currentDiscount > 0) {
    discountAmount = calculateDiscount(subtotal, currentDiscount);
  }

  finalCost = Math.max(0, subtotal - discountAmount);

  // Update UI
  if (discountEl) discountEl.textContent = `€${discountAmount.toFixed(2)}`;
  if (finalCostEl) finalCostEl.textContent = `€${finalCost.toFixed(2)}`;

  // Store for later use
  if (wizardMode === 'manage') {
    manageWizard.selection.discount = discountAmount;
    manageWizard.selection.finalCost = finalCost;
  }
}

function applyPromoCodeToWizard(wizardMode = 'add') {
  const promoInput = wizardMode === 'manage' ? document.getElementById('managePromoCode') : document.getElementById('promoCode');
  const errorEl = wizardMode === 'manage' ? document.getElementById('managePromoError') : document.getElementById('promoError');
  const successEl = wizardMode === 'manage' ? document.getElementById('managePromoSuccess') : document.getElementById('promoSuccess');

  const code = promoInput?.value || '';
  const result = validatePromoCode(code);

  // Clear messages
  if (errorEl) errorEl.classList.add('d-none');
  if (successEl) successEl.classList.add('d-none');

  if (!result.valid) {
    if (errorEl) {
      errorEl.textContent = result.message;
      errorEl.classList.remove('d-none');
    }
    currentPromoCode = null;
    currentDiscount = 0;
  } else {
    if (successEl) {
      successEl.textContent = result.message;
      successEl.classList.remove('d-none');
    }
    currentPromoCode = result.code;
    currentDiscount = result.discount;
  }

  updateFinalCost(wizardMode);
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
  if (wizardStep === 3) { 
    if (!billingComplete()) return; 
    buildSummary(); 
    updateFinalCost('add'); 
    setStep(4); 
    return; 
  }
});
payBtn?.addEventListener("click", completePayment);

// Promo code button for add wizard
document.getElementById('applyPromoBtn')?.addEventListener('click', () => applyPromoCodeToWizard('add'));

// Gating & estimate updates
document.addEventListener("change", (e) => {
  // API subscription
  if (e.target.classList.contains("device-check") || e.target.id === "apiTier") {
    updateEstimate(); updateNextState();
  }
  if (e.target.id === "apiStart" || e.target.id === "apiEnd") updateNextState();
  
  // Disease Models subscription
  if (e.target.id === "dmCrop") {
    const selectedCrop = e.target.value;
    const dmCropError = document.getElementById('dmCropError');
    const dmCropErrorText = document.getElementById('dmCropErrorText');
    
    // Check if subscription already exists for this crop
    const existingSub = seed.find(s => s.crop === selectedCrop && (s.product?.includes('Disease Models') || s.plan === 'DM License'));
    
    if (existingSub && selectedCrop) {
      const cropName = DM_CROPS[selectedCrop]?.name || selectedCrop;
      if (dmCropError) {
        dmCropErrorText.textContent = `A Disease Models subscription for ${cropName} already exists. To add more devices, use the MANAGE button on your existing subscription.`;
        dmCropError.classList.remove('d-none');
      }
      // Reset the select and don't render devices
      e.target.value = '';
      renderDMDevices('');
    } else {
      if (dmCropError) dmCropError.classList.add('d-none');
      renderDMDevices(selectedCrop);
    }
    updateNextState();
  }
  if (e.target.id === "dmStart" || e.target.id === "dmEnd") updateNextState();
  
  // Billing fields
  if (["billName","billEmail","billAddress","billCountry","billMethod","billVat"].includes(e.target.id)) updateNextState();
});
document.addEventListener("input", (e) => {
  if (["billName","billEmail","billAddress","billCountry"].includes(e.target.id)) updateNextState();
});

// Page buttons
newBtn?.addEventListener("click", openWizard);
refreshBtn?.addEventListener("click", render);

// Actions dropdown functions
function refreshData() {
  render();
  // Show brief feedback
  const toast = document.createElement('div');
  toast.className = 'position-fixed bottom-0 end-0 p-3';
  toast.innerHTML = `
    <div class="toast show" role="alert">
      <div class="toast-body d-flex align-items-center">
        <i class="bi bi-check-circle text-success me-2"></i>
        Data refreshed
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function exportToCSV() {
  const headers = ['Product', 'Plan', 'Billing', 'Start Date', 'End Date', 'Status', 'Cost'];
  const rows = seed.map(row => [
    row.product || '',
    row.plan || row.tier || '',
    row.billing || '',
    row.start || row.startDate || '',
    row.expiry || row.endDate || '',
    row.status || '',
    row.cost || ''
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

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
  
  // Reset promo code state
  currentPromoCode = null;
  currentDiscount = 0;
  
  // Clear promo code input and messages
  const managePromoInput = document.getElementById('managePromoCode');
  const managePromoError = document.getElementById('managePromoError');
  const managePromoSuccess = document.getElementById('managePromoSuccess');
  if (managePromoInput) managePromoInput.value = '';
  if (managePromoError) managePromoError.classList.add('d-none');
  if (managePromoSuccess) managePromoSuccess.classList.add('d-none');
  
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
    
    const isDM = sub.crop || (sub.product && sub.product.includes('Disease Models'));
    
    if (isDM) {
      // Disease Models subscription overview
      const cropName = sub.cropName || DM_CROPS[sub.crop]?.name || sub.crop || '—';
      ov.innerHTML = `
        <h6 class="fw-bold mb-3">Subscription overview</h6>
        <div class="row mb-4">
          <div class="col-6">
            <div class="mb-3">
              <div class="text-secondary small">Product</div>
              <div class="fw-semibold">${sub.product || 'Disease Models'}</div>
            </div>
            <div class="mb-3">
              <div class="text-secondary small">Crop</div>
              <div class="fw-semibold">${cropName}</div>
            </div>
            <div>
              <div class="text-secondary small">Devices (Licenses)</div>
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
          <button type="button" class="btn btn-outline-danger btn-sm" id="manageActionDelete">Delete</button>
        </div>
      `;
    } else {
      // Client API subscription overview
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
    }
    
    const addBtn = document.getElementById('manageActionAdd');
    const upBtn = document.getElementById('manageActionUpgrade');
    const quotaBtn = document.getElementById('manageActionQuota');
    const delBtn = document.getElementById('manageActionDelete');
    if (addBtn) addBtn.onclick = () => { manageWizard.mode = 'add-devices'; manageWizard.step = 2; manageRenderStep(); };
    if (upBtn) upBtn.onclick = () => { manageWizard.mode = 'upgrade-tier'; manageWizard.step = 2; manageRenderStep(); };
    if (quotaBtn) quotaBtn.onclick = () => { manageWizard.mode = 'check-quota'; manageWizard.step = 2; manageRenderStep(); };
    if (delBtn) delBtn.onclick = () => {
      confirmAction(`Delete subscription "${sub.product}"?`, () => {
        seed.splice(manageWizard.subId, 1);
        bootstrap.Modal.getInstance(manageModalEl)?.hide();
        render();
      }, { title: 'Delete Subscription', confirmText: 'Delete' });
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
        const isDM = sub.crop || (sub.product && sub.product.includes('Disease Models'));
        
        content.innerHTML = `
          <h6 class="fw-bold mb-2">Select devices to add</h6>
          <div class="row g-3">
            <div class="col-12">
              <div class="border rounded-3 p-2" style="max-height: 250px; overflow-y: auto;">
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
        
        if (isDM) {
          // Disease Models: show DM_DEVICES filtered by crop sensors with model compatibility
          const cropKey = sub.crop;
          const crop = DM_CROPS[cropKey];
          
          if (crop && crop.models) {
            const modelNames = crop.models.map(m => m.name).join(', ');
            listEl.innerHTML = `<div class="small text-secondary mb-2"><strong>Available models for ${crop.name}:</strong> ${modelNames}</div>`;
          }
          
          DM_DEVICES.forEach(dev => {
            const isExisting = existing.includes(dev.id);
            const { compatible } = deviceHasRequiredSensors(dev.id, cropKey);
            const { supported, unsupported } = getDeviceModelCompatibility(dev.id, cropKey);
            const totalModels = (crop?.models || []).length;
            const supportedCount = supported.length;
            const canSelect = compatible && !isExisting;
            
            // Determine badge
            let badge = '';
            let badgeClass = '';
            if (isExisting) {
              badge = 'Already added';
              badgeClass = 'bg-secondary-subtle text-secondary';
            } else if (supportedCount === totalModels) {
              badge = `All ${totalModels} models`;
              badgeClass = 'bg-success-subtle text-success';
            } else if (supportedCount > 0) {
              badge = `${supportedCount}/${totalModels} models`;
              badgeClass = 'bg-warning-subtle text-warning';
            } else {
              badge = 'No models';
              badgeClass = 'bg-danger-subtle text-danger';
            }
            
            // Build model compatibility details
            let modelDetails = '';
            if (!isExisting && supported.length > 0) {
              modelDetails += `<div class="small text-success mt-1"><i class="bi bi-check-circle-fill me-1"></i>${supported.map(m => m.name).join(', ')}</div>`;
            }
            if (!isExisting && unsupported.length > 0) {
              modelDetails += `<div class="small text-danger mt-1"><i class="bi bi-x-circle-fill me-1"></i>${unsupported.map(m => m.name).join(', ')}</div>`;
            }
            
            const div = document.createElement('div');
            div.className = `form-check py-2 border-bottom ${canSelect ? '' : 'opacity-50'}`;
            div.innerHTML = `
              <input class="form-check-input" type="checkbox" value="${dev.id}" id="manageDev_${dev.id}" ${isExisting ? 'checked disabled' : ''} ${!compatible ? 'disabled' : ''}>
              <label class="form-check-label w-100" for="manageDev_${dev.id}">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-medium">${dev.name}</span>
                  <span class="badge ${badgeClass} small">${badge}</span>
                </div>
                <div class="small text-secondary">
                  Sensors: ${dev.sensors.map(s => SENSOR_NAMES[s] || s).join(', ')}
                </div>
                ${modelDetails}
              </label>
            `;
            listEl.appendChild(div);
          });
        } else {
          // Client API: show API devices from step2
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
        }
        
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
      
      const isDM = sub.crop || (sub.product && sub.product.includes('Disease Models'));
      
      if (isDM) {
        // Disease Models: bracket pricing
        const existingCount = (sub.devices || []).length;
        const newTotalCount = existingCount + added.length;
        const currentCostPerYear = calculateDMCost(existingCount).total;
        const newCostPerYear = calculateDMCost(newTotalCount).total;
        const additionalCostPerYear = newCostPerYear - currentCostPerYear;
        amount = additionalCostPerYear * fr;
        const newPricePerLicense = getDMPricePerLicense(newTotalCount);
        
        html += `
          <div class="row g-2 small">
            <div class="col-4 text-secondary">Action</div><div class="col-8 fw-semibold">Add ${added.length} license(s)</div>
            <div class="col-4 text-secondary">Current licenses</div><div class="col-8">${existingCount}</div>
            <div class="col-4 text-secondary">New total</div><div class="col-8">${newTotalCount}</div>
            <div class="col-4 text-secondary">Bracket price</div><div class="col-8">€${newPricePerLicense}/license/year</div>
            <div class="col-4 text-secondary">Proration</div><div class="col-8">${fr.toFixed(2)} (${remainingDaysForSub(sub)} days remaining)</div>
            <div class="col-4 text-secondary">Total</div><div class="col-8 fw-bold">€${amount.toFixed(2)}</div>
          </div>
        `;
      } else {
        // Client API: flat per-device pricing
        amount = added.length * DEVICE_PRICE * fr;
        
        html += `
          <div class="row g-2 small">
            <div class="col-4 text-secondary">Action</div><div class="col-8 fw-semibold">Add ${added.length} device(s)</div>
            <div class="col-4 text-secondary">Cost/device</div><div class="col-8">€${DEVICE_PRICE}</div>
            <div class="col-4 text-secondary">Proration</div><div class="col-8">${fr.toFixed(2)} remaining</div>
            <div class="col-4 text-secondary">Total</div><div class="col-8 fw-bold">€${amount.toFixed(2)}</div>
          </div>
        `;
      }
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
    
    // Initialize final cost display for manage wizard
    updateFinalCost('manage');
    
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
  const est = document.getElementById('manageDevicesEstimate');
  
  const isDM = sub.crop || (sub.product && sub.product.includes('Disease Models'));
  
  if (isDM) {
    // Disease Models: bracket pricing based on total device count
    const existingCount = (sub.devices || []).length;
    const newTotalCount = existingCount + selected;
    
    // Calculate cost difference: new total cost - current cost, pro-rated
    const currentCostPerYear = calculateDMCost(existingCount).total;
    const newCostPerYear = calculateDMCost(newTotalCount).total;
    const additionalCostPerYear = newCostPerYear - currentCostPerYear;
    const cost = additionalCostPerYear * fr;
    
    const newPricePerLicense = getDMPricePerLicense(newTotalCount);
    
    if (est) {
      if (selected === 0) {
        est.textContent = 'Select devices to see pro-rata cost estimate.';
      } else {
        est.innerHTML = `
          <div class="mb-1"><strong>Pro-rata calculation:</strong></div>
          <div>Current licenses: ${existingCount} | Adding: ${selected} | New total: ${newTotalCount}</div>
          <div>New bracket price: €${newPricePerLicense}/license/year</div>
          <div>Additional cost/year: €${additionalCostPerYear.toFixed(2)}</div>
          <div>Pro-rata (${remainingDays} days remaining): €${additionalCostPerYear.toFixed(2)} × ${fr.toFixed(3)} = <strong>€${cost.toFixed(2)}</strong></div>
        `;
      }
    }
  } else {
    // Client API: flat per-device pricing
    const cost = selected * DEVICE_PRICE * fr;
    if (est) est.textContent = `Prorated for remaining subscription: €${DEVICE_PRICE}/device/yr × ${selected} devices × ${fr.toFixed(3)} (for remaining ${remainingDays} days) = €${cost.toFixed(2)}`;
  }
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
  const amount = (manageWizard.selection.finalCost !== undefined) ? manageWizard.selection.finalCost : (manageWizard.selection.amountDue || 0);
  // simulate payment success
  // apply changes
  if (manageWizard.mode === 'add-devices') {
    const toAdd = manageWizard.selection.addDevices || [];
    sub.devices = Array.from(new Set([...(sub.devices || []), ...toAdd]));
    
    // Update product name to reflect new device count
    const isDM = sub.crop || (sub.product && sub.product.includes('Disease Models'));
    if (isDM) {
      const cropName = sub.cropName || DM_CROPS[sub.crop]?.name || sub.crop || 'Unknown';
      sub.product = `Disease Models - ${cropName} (${sub.devices.length} license${sub.devices.length === 1 ? '' : 's'})`;
    } else {
      sub.product = `Client API (${sub.devices.length} device${sub.devices.length === 1 ? '' : 's'})`;
    }
    
    // update cost stored on subscription if you store it
    sub.cost = (sub.cost || 0) + amount;
    sub.discountApplied = currentPromoCode || null;
  } else if (manageWizard.mode === 'upgrade-tier') {
    const newTier = manageWizard.selection.newTier;
    if (newTier && newTier !== (sub.plan || sub.tier)) {
      sub.plan = newTier;
      sub.cost = (sub.cost || 0) + amount;
      sub.discountApplied = currentPromoCode || null;
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

// Promo code button for manage wizard
document.getElementById('manageApplyPromoBtn')?.addEventListener('click', () => applyPromoCodeToWizard('manage'));

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

// Confirm action with Bootstrap modal
function confirmAction(message, onConfirm, options = {}) {
  const title = options.title || 'Confirm Action';
  const confirmText = options.confirmText || 'Delete';
  const confirmClass = options.confirmClass || 'btn-danger';
  
  let modalEl = document.getElementById('confirmActionModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'confirmActionModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title" id="confirmModalTitle"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="confirmModalBody"></div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn" id="confirmModalBtn"></button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }
  
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalBody').textContent = message;
  const confirmBtn = document.getElementById('confirmModalBtn');
  confirmBtn.textContent = confirmText;
  confirmBtn.className = `btn ${confirmClass}`;
  
  const handleConfirm = () => {
    modal.hide();
    onConfirm();
  };
  
  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  document.getElementById('confirmModalBtn').addEventListener('click', handleConfirm);
  
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// Init
render();