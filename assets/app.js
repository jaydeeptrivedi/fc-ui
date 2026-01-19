// assets/app.js
const seed = [
  { product: "Disease Model", start: "2024-05-08", expiry: "2026-05-08", plan: "Tier 2", billing: "Paid", status: "Active" },
  { product: "FarmView with Satellite for 25 CropZones for 1 year", start: "2025-06-17", expiry: "2026-06-17", plan: "Tier 2", billing: "Country Pay", status: "Active" },
  { product: "Weather Forecast", start: "2025-10-27", expiry: "2026-10-27", plan: "Tier 1", billing: "Paid", status: "Active" },
  { product: "Client API", start: "2025-12-17", expiry: "2026-12-17", plan: "Tier 2", billing: "Paid", status: "Active" }
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

const tierPricePerDeviceEUR = { "Tier 1": 10, "Tier 2": 25, "Tier 3": 50 };

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
          <button class="btn btn-primary btn-sm" type="button" data-action="details" data-idx="${idx}">DETAILS</button>
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
  manageIndex = idx;
  const row = seed[idx];
  mProduct.value = row.product;
  mPlan.value = row.plan;
  mBilling.value = row.billing;
  mStart.value = row.start;
  mExpiry.value = row.expiry;
  mStatus.value = row.status;
  manageModal?.show();
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
  const required = [billName.value, billEmail.value, billAddress.value, billCountry.value];
  return required.every(v => (v || "").trim().length > 0);
}

function updateEstimate() {
  const devCount = selectedDevices().length;
  const tier = apiTier.value;
  if (!devCount) {
    estCost.textContent = "€—";
    estNote.textContent = "Select devices to see an estimate.";
    return;
  }
  const perDevice = tierPricePerDeviceEUR[tier] || 0;
  const total = perDevice * devCount;
  estCost.textContent = `€${total}`;
  estNote.textContent = `${devCount} device(s) × €${perDevice}/device/year (demo)`;
}

function buildSummary() {
  const devs = selectedDevices();
  const tier = apiTier.value;
  const start = apiStart.value;
  const end = apiEnd.value;
  const perDevice = tierPricePerDeviceEUR[tier] || 0;
  const cost = devs.length ? perDevice * devs.length : 0;

  sumType.textContent = selectedType || "—";
  sumDevices.textContent = devs.length ? devs.join(", ") : "—";
  sumTier.textContent = tier || "—";
  sumDates.textContent = (start && end) ? `${start} → ${end}` : "—";
  sumBilling.textContent = billMethod.value || "—";
  sumCost.textContent = devs.length ? `€${cost}` : "€—";

  return { devs, tier, start, end, cost, billing: billMethod.value };
}

function completePayment() {
  const { devs, tier, start, end, billing } = buildSummary();
  const status = (billing === "Self Pay") ? "Active" : "Pending";

  seed.push({
    product: `Client API (${devs.length} device${devs.length === 1 ? "" : "s"})`,
    start,
    expiry: end,
    plan: tier,
    billing,
    status
  });

  render();
  wizard?.hide();
}

// Type selection
document.addEventListener("click", (e) => {
  const card = e.target.closest(".selectable");
  if (!card) return;
  const subtype = card.getAttribute("data-subtype");
  selectableCards().forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
  selectedType = subtype; // API/Webhooks/SMS
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
