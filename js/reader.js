const params = new URLSearchParams(window.location.search);
const novelId = params.get("novel");

let currentVolume = null;
let currentChapter = null;
let isLoading = false;

document.addEventListener("DOMContentLoaded", init);

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  isLoading = true;
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
  isLoading = false;
}

async function init() {
  showLoading();

  currentVolume = await getFirstVolume(novelId);
  currentChapter = await getFirstChapter(currentVolume.id);

  render();
  hideLoading();

  document.getElementById("nextBtn").onclick = goNext;
  document.getElementById("prevBtn").onclick = goPrev;
  document.getElementById("homeBtn").onclick = goHome;
}

// render
function render() {
  document.getElementById("volume").textContent = currentVolume.title;
  document.getElementById("chapter").textContent = currentChapter.title;

  document.getElementById("content").innerHTML =
    marked.parse(currentChapter.content);

  window.scrollTo({ top: 0 });

  updateNav();
}

// next
async function goNext() {
  if (isLoading) return;
  showLoading();

  let next = await getNextChapter(
    currentVolume.id,
    currentChapter.chapter_number
  );

  if (next) {
    currentChapter = next;
    render();
    hideLoading();
    return;
  }

  let nextVol = await getNextVolume(
    novelId,
    currentVolume.volume_number
  );

  if (!nextVol) {
    hideLoading();
    return;
  }

  currentVolume = nextVol;
  currentChapter = await getFirstChapter(currentVolume.id);

  render();
  hideLoading();
}

// prev
async function goPrev() {
  if (isLoading) return;
  showLoading();

  let prev = await getPrevChapter(
    currentVolume.id,
    currentChapter.chapter_number
  );

  if (prev) {
    currentChapter = prev;
    render();
    hideLoading();
    return;
  }

  let prevVol = await getPrevVolume(
    novelId,
    currentVolume.volume_number
  );

  if (!prevVol) {
    hideLoading();
    return;
  }

  currentVolume = prevVol;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/chapters?volume_id=eq.${currentVolume.id}&order=chapter_number.desc&limit=1`,
    { headers: headers() }
  );

  const data = await res.json();
  currentChapter = data[0];

  render();
  hideLoading();
}

// nav control
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

  document.getElementById("nextBtn").disabled = !next && !nextVol;
  document.getElementById("prevBtn").disabled = !prev && !prevVol;
}

// back
function goHome() {
  if (isLoading) return;
  showLoading();
  window.location.href = "index.html";
}