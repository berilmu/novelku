const params = new URLSearchParams(window.location.search);
const novelId = params.get("novel");

let currentVolume = null;
let currentChapter = null;

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

function render() {
  document.getElementById("volume").innerText = currentVolume.title;
  document.getElementById("chapter").innerText = currentChapter.title;

  // 🔥 DEBUG MARKED
  if (typeof marked === "undefined") {
    console.error("Marked.js belum ke-load!");
    document.getElementById("content").innerText = currentChapter.content;
    return;
  }

  // 🔥 RENDER MARKDOWN
  document.getElementById("content").innerHTML =
    marked.parse(currentChapter.content);
}

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

  if (!nextVol) {
    alert("Tamat 🔥");
    return;
  }

  currentVolume = nextVol;
  currentChapter = await getFirstChapter(currentVolume.id);

  render();
}

// 🔥 pastikan tombol sudah ada sebelum dipakai
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("nextBtn");

  if (btn) {
    btn.addEventListener("click", nextChapter);
  } else {
    console.error("Tombol nextBtn tidak ditemukan");
  }

  initReader();
});