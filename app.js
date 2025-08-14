/* Aplikasi Laporan Surat Masuk/Keluar — PD Pontren Gowa
   - Penyimpanan: LocalStorage (perangkat lokal)
   - Ekspor/Impor: JSON dan CSV
   - PWA: dapat diinstal & offline
*/

const STORE_KEY = "pdpontren_surat_v1";
let state = {
  items: [], // array of item
};

// ---- Util ----
const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));
const fmtDate = (d) => !d ? "" : new Date(d).toISOString().slice(0,10);
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : (Date.now() + "_" + Math.random().toString(16).slice(2));
const download = (filename, mime, content) => {
  const blob = new Blob([content], {type:mime});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
};
const toCSV = (arr) => {
  if (!arr.length) return "";
  const cols = Object.keys(arr[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g,'""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  }
  const header = cols.join(",");
  const rows = arr.map(o => cols.map(c => escape(o[c])).join(","));
  return [header, ...rows].join("\n");
};
const parseDateNum = (d) => d ? Number(String(d).replaceAll("-","")) : 0;

// ---- Storage ----
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch(e) {
    console.error("Gagal memuat data", e);
  }
}
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

// ---- Rendering ----
function renderTable() {
  const tbody = $("#tbl tbody");
  tbody.innerHTML = "";
  const q = ($("#filterCari").value || "").toLowerCase().trim();
  const jenis = $("#filterJenis").value;
  const dari = $("#filterDari").value;
  const sampai = $("#filterSampai").value;
  let count = 0;

  const filtered = state.items.filter(it => {
    if (jenis !== "semua" && it.jenis !== jenis) return false;
    if (dari && parseDateNum(it.tanggalTerimaKirim) < parseDateNum(dari)) return false;
    if (sampai && parseDateNum(it.tanggalTerimaKirim) > parseDateNum(sampai)) return false;
    if (q) {
      const hay = [it.nomor, it.perihal, it.asalTujuan, it.sifat, it.disposisi, it.catatan].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a,b) => (a.tanggalTerimaKirim || "").localeCompare(b.tanggalTerimaKirim));

  for (const it of filtered) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="pill ${it.jenis}">${it.jenis}</span></td>
      <td>${it.nomor||""}</td>
      <td>${it.tanggalSurat||""}</td>
      <td>${it.tanggalTerimaKirim||""}</td>
      <td>${it.asalTujuan||""}</td>
      <td>${it.perihal||""}</td>
      <td>${it.sifat||""}</td>
      <td>${it.lampiran||""}</td>
      <td>${it.disposisi||""}</td>
      <td>${it.catatan||""}</td>
      <td>
        <button class="btn ghost" data-act="edit" data-id="${it.id}" title="Edit">✏️</button>
        <button class="btn danger" data-act="del" data-id="${it.id}" title="Hapus">🗑️</button>
      </td>
    `;
    tr.addEventListener("click", (e) => {
      // Prevent row-click when clicking buttons
      if (e.target.closest("button")) return;
      startEdit(it.id);
    });
    tr.querySelector('[data-act="edit"]').addEventListener("click", (e) => {
      e.stopPropagation();
      startEdit(it.id);
    });
    tr.querySelector('[data-act="del"]').addEventListener("click", (e) => {
      e.stopPropagation();
      del(it.id);
    });
    tbody.appendChild(tr);
    count++;
  }
  $("#countInfo").textContent = `${count} entri terlihat • total ${state.items.length}`;

  // Rekap info
  const masuk = filtered.filter(x=>x.jenis==="masuk").length;
  const keluar = filtered.filter(x=>x.jenis==="keluar").length;
  $("#rekapInfo").textContent = `Tersaring: ${masuk} Masuk • ${keluar} Keluar`;
}

function startEdit(id) {
  const it = state.items.find(x=>x.id===id);
  if (!it) return;
  $("#editingId").value = id;
  $("#jenis").value = it.jenis;
  $("#nomor").value = it.nomor;
  $("#tanggalSurat").value = it.tanggalSurat || "";
  $("#tanggalTerimaKirim").value = it.tanggalTerimaKirim || "";
  $("#asalTujuan").value = it.asalTujuan || "";
  $("#perihal").value = it.perihal || "";
  $("#sifat").value = it.sifat || "Biasa";
  $("#lampiran").value = it.lampiran || "";
  $("#disposisi").value = it.disposisi || "";
  $("#catatan").value = it.catatan || "";
  window.scrollTo({top:0,behavior:"smooth"});
}

function del(id) {
  if (!confirm("Hapus entri ini?")) return;
  state.items = state.items.filter(x=>x.id!==id);
  save();
  renderTable();
}

// ---- Actions ----
$("#formSurat").addEventListener("submit", (e)=>{
  e.preventDefault();
  const data = {
    id: $("#editingId").value || uuid(),
    jenis: $("#jenis").value,
    nomor: $("#nomor").value.trim(),
    tanggalSurat: $("#tanggalSurat").value,
    tanggalTerimaKirim: $("#tanggalTerimaKirim").value,
    asalTujuan: $("#asalTujuan").value.trim(),
    perihal: $("#perihal").value.trim(),
    sifat: $("#sifat").value,
    lampiran: $("#lampiran").value.trim(),
    disposisi: $("#disposisi").value.trim(),
    catatan: $("#catatan").value.trim(),
    dibuatPada: new Date().toISOString()
  };

  const idx = state.items.findIndex(x=>x.id===data.id);
  if (idx >= 0) state.items[idx] = data; else state.items.push(data);
  save();
  $("#formSurat").reset();
  $("#editingId").value = "";
  renderTable();
});

["#filterJenis","#filterDari","#filterSampai","#filterCari"].forEach(sel=>{
  $(sel).addEventListener("input", renderTable);
});

$("#btnBackup").addEventListener("click", ()=>{
  const payload = JSON.stringify(state, null, 2);
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  download(`backup-surat-${ts}.json`,"application/json", payload);
});

$("#fileRestore").addEventListener("change", async (e)=>{
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const imported = JSON.parse(text);
    if (!imported || !Array.isArray(imported.items)) throw new Error("Format tidak cocok");
    if (!confirm("Timpa data yang ada dengan data dari berkas ini?")) return;
    state = imported;
    save();
    renderTable();
    alert("Data berhasil dipulihkan.");
  } catch(err) {
    alert("Gagal memulihkan: " + err.message);
  } finally {
    e.target.value = "";
  }
});

$("#btnExportJSON").addEventListener("click", ()=>{
  const filtered = getFiltered();
  const ts = new Date().toISOString().slice(0,10);
  download(`laporan-surat-${ts}.json`, "application/json", JSON.stringify(filtered, null, 2));
});

$("#btnExportCSV").addEventListener("click", ()=>{
  const filtered = getFiltered();
  const ts = new Date().toISOString().slice(0,10);
  const csv = toCSV(filtered);
  download(`laporan-surat-${ts}.csv`, "text/csv;charset=utf-8", csv);
});

$("#btnPrint").addEventListener("click", ()=>{
  window.print();
});

function getFiltered(){
  const q = ($("#filterCari").value || "").toLowerCase().trim();
  const jenis = $("#filterJenis").value;
  const dari = $("#filterDari").value;
  const sampai = $("#filterSampai").value;
  const filtered = state.items.filter(it => {
    if (jenis !== "semua" && it.jenis !== jenis) return false;
    if (dari && parseDateNum(it.tanggalTerimaKirim) < parseDateNum(dari)) return false;
    if (sampai && parseDateNum(it.tanggalTerimaKirim) > parseDateNum(sampai)) return false;
    if (q) {
      const hay = [it.nomor, it.perihal, it.asalTujuan, it.sifat, it.disposisi, it.catatan].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  return filtered;
}

// ---- PWA Install ----
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $("#btnInstall").classList.remove("hidden");
});
$("#btnInstall").addEventListener("click", async () => {
  if (!deferredPrompt) { alert("Aplikasi siap dipasang dari menu browser."); return; }
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  if (choice.outcome === "accepted") {
    $("#btnInstall").textContent = "Terpasang ✔";
  }
  deferredPrompt = null;
});
window.addEventListener("appinstalled", () => {
  $("#btnInstall").textContent = "Terpasang ✔";
});

// ---- Service Worker ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

// ---- Init ----
load();
renderTable();
