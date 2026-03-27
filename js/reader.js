const params = new URLSearchParams(window.location.search);
const novelId = params.get("novel");

let currentVolume = null;
let currentChapter = null;

async function initReader() {
  currentVolume = await getFirstVolume(novelId);
  currentChapter = await getFirstChapter(currentVolume.id);
  render();
}

function render() {
  document.getElementById("volume").innerText = currentVolume.title;
  document.getElementById("chapter").innerText = currentChapter.title;

  // 🔥 INI YANG DIUBAH
  document.getElementById("content").innerHTML = marked.parse(currentChapter.content);
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

document.getElementById("nextBtn").addEventListener("click", nextChapter);

initReader();