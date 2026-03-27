const params = new URLSearchParams(window.location.search);
const novelId = params.get("novel");

let currentVolume = null;
let currentChapter = null;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", init);

async function init() {
  const volume = await getFirstVolume(novelId);
  if (!volume) return;

  const chapter = await getFirstChapter(volume.id);
  if (!chapter) return;

  currentVolume = volume;
  currentChapter = chapter;

  render();

  document.getElementById("nextBtn").onclick = goNext;
  document.getElementById("prevBtn").onclick = goPrev;
}

// ================= RENDER =================
function render() {
  document.getElementById("volume").textContent = currentVolume.title;
  document.getElementById("chapter").textContent = currentChapter.title;

  const contentEl = document.getElementById("content");

  contentEl.innerHTML =
    typeof marked !== "undefined"
      ? marked.parse(currentChapter.content)
      : currentChapter.content;

  // 🔥 scroll ke atas
  window.scrollTo({ top: 0 });

  updateNav();
}

// ================= NEXT =================
async function goNext() {
  let next = await getNextChapter(
    currentVolume.id,
    currentChapter.chapter_number
  );

  if (next) {
    currentChapter = next;
    render();
    return;
  }

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
async function goPrev() {
  let prev = await getPrevChapter(
    currentVolume.id,
    currentChapter.chapter_number
  );

  if (prev) {
    currentChapter = prev;
    render();
    return;
  }

  let prevVol = await getPrevVolume(
    novelId,
    currentVolume.volume_number
  );

  if (!prevVol) return;

  currentVolume = prevVol;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/chapters?volume_id=eq.${currentVolume.id}&order=chapter_number.desc&limit=1`,
    { headers: headers() }
  );

  const data = await res.json();
  if (!data.length) return;

  currentChapter = data[0];

  render();
}

// ================= NAV CONTROL =================
async function updateNav() {
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

  document.getElementById("nextBtn").hidden = !next && !nextVol;
  document.getElementById("prevBtn").hidden = !prev && !prevVol;
}