const params = new URLSearchParams(window.location.search);
const novelId = params.get("novel");

let currentVolume = null;
let currentChapter = null;

// ================= INIT =================
async function initReader() {
  currentVolume = await getFirstVolume(novelId);

  if (!currentVolume) {
    console.error("Volume tidak ditemukan");
    return;
  }

  currentChapter = await getFirstChapter(currentVolume.id);

  if (!currentChapter) {
    console.error("Chapter tidak ditemukan");
    return;
  }

  render();
}

// ================= RENDER =================
function render() {
  document.getElementById("volume").innerText = currentVolume.title;
  document.getElementById("chapter").innerText = currentChapter.title;

  // 🔥 markdown render
  if (typeof marked !== "undefined") {
    document.getElementById("content").innerHTML =
      marked.parse(currentChapter.content);
  } else {
    console.error("Marked.js belum ke-load");
    document.getElementById("content").innerText =
      currentChapter.content;
  }

  updateButtons();
}

// ================= NEXT =================
async function nextChapter() {
  let next = await getNextChapter(
    currentVolume.id,
    currentChapter.chapter_number
  );

  if (next) {
    currentChapter = next;
    render();
    return;
  }

  // pindah ke volume berikutnya
  let nextVol = await getNextVolume(
    novelId,
    currentVolume.volume_number
  );

  if (!nextVol) return;

  currentVolume = nextVol;
  currentChapter = await getFirstChapter(currentVolume.id);

  render();
}

// ================= PREV =================
async function prevChapter() {
  let prev = await getPrevChapter(
    currentVolume.id,
    currentChapter.chapter_number
  );

  if (prev) {
    currentChapter = prev;
    render();
    return;
  }

  // pindah ke volume sebelumnya
  let prevVol = await getPrevVolume(
    novelId,
    currentVolume.volume_number
  );

  if (!prevVol) return;

  currentVolume = prevVol;

  // ambil chapter terakhir di volume sebelumnya
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/chapters?volume_id=eq.${currentVolume.id}&order=chapter_number.desc&limit=1`,
    { headers: headers() }
  );

  const data = await res.json();
  currentChapter = data[0];

  render();
}

// ================= BUTTON STATE =================
async function updateButtons() {
  const next = await getNextChapter(
    currentVolume.id,
    currentChapter.chapter_number
  );

  const nextVol = await getNextVolume(
    novelId,
    currentVolume.volume_number
  );

  const prev = await getPrevChapter(
    currentVolume.id,
    currentChapter.chapter_number
  );

  const prevVol = await getPrevVolume(
    novelId,
    currentVolume.volume_number
  );

  document.getElementById("nextBtn").disabled = !next && !nextVol;
  document.getElementById("prevBtn").disabled = !prev && !prevVol;
}

// ================= EVENT =================
document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (nextBtn) nextBtn.addEventListener("click", nextChapter);
  if (prevBtn) prevBtn.addEventListener("click", prevChapter);

  initReader();
});