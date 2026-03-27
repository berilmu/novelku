const params = new URLSearchParams(window.location.search);
const novelId = params.get("novel");

let currentVolume = null;
let currentChapter = null;

// ================= INIT =================
async function initReader() {
  currentVolume = await getFirstVolume(novelId);
  currentChapter = await getFirstChapter(currentVolume.id);

  if (!currentVolume || !currentChapter) {
    console.error("Data tidak lengkap");
    return;
  }

  render();
}

// ================= RENDER =================
function render() {
  document.getElementById("volume").innerText = currentVolume.title;
  document.getElementById("chapter").innerText = currentChapter.title;

  // markdown
  document.getElementById("content").innerHTML =
    typeof marked !== "undefined"
      ? marked.parse(currentChapter.content)
      : currentChapter.content;

  // 🔥 scroll ke atas
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

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

  let prevVol = await getPrevVolume(
    novelId,
    currentVolume.volume_number
  );

  if (!prevVol) return;

  currentVolume = prevVol;

  // 🔥 ambil chapter terakhir dengan helper API (bukan fetch manual)
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/chapters?volume_id=eq.${currentVolume.id}&order=chapter_number.desc&limit=1`,
    { headers: headers() }
  );

  const data = await res.json();

  if (!data.length) return;

  currentChapter = data[0];

  render();
}

// ================= BUTTON VISIBILITY =================
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

  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  // 🔥 tampil / hilang setelah data siap
  if (next || nextVol) {
    nextBtn.style.display = "inline-block";
  } else {
    nextBtn.style.display = "none";
  }

  if (prev || prevVol) {
    prevBtn.style.display = "inline-block";
  } else {
    prevBtn.style.display = "none";
  }
}

// ================= EVENT =================
document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  nextBtn.addEventListener("click", nextChapter);
  prevBtn.addEventListener("click", prevChapter);

  initReader();
});