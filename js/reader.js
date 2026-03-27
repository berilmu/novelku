const params = new URLSearchParams(window.location.search);
const novelId = params.get("novel");

let currentVolume = null;
let currentChapter = null;
let isLoading = false;

document.addEventListener("DOMContentLoaded", init);

// ================= LOADING =================
function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
  isLoading = true;
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
  isLoading = false;
}

// ================= INIT =================
async function init() {
  try {
    showLoading();

    currentVolume = await getFirstVolume(novelId);
    currentChapter = await getFirstChapter(currentVolume.id);

    render();
  } catch (err) {
    console.error("INIT ERROR:", err);
  } finally {
    hideLoading();
  }

  document.getElementById("nextBtn").onclick = goNext;
  document.getElementById("prevBtn").onclick = goPrev;
  document.getElementById("homeBtn").onclick = goHome;
}

// ================= RENDER =================
function render() {
  document.getElementById("volume").textContent = currentVolume.title;
  document.getElementById("chapter").textContent = currentChapter.title;

  document.getElementById("content").innerHTML =
    typeof marked !== "undefined"
      ? marked.parse(currentChapter.content)
      : currentChapter.content;

  window.scrollTo({ top: 0 });

  updateNav();
}

// ================= NEXT =================
async function goNext() {
  if (isLoading) return;

  try {
    showLoading();

    let next = await getNextChapter(
      currentVolume.id,
      currentChapter.chapter_number
    );

    if (next) {
      currentChapter = next;
    } else {
      let nextVol = await getNextVolume(
        novelId,
        currentVolume.volume_number
      );

      if (!nextVol) return;

      currentVolume = nextVol;
      currentChapter = await getFirstChapter(currentVolume.id);
    }

    render();
  } catch (err) {
    console.error("NEXT ERROR:", err);
  } finally {
    hideLoading(); // 🔥 PASTI KEJALAN
  }
}

// ================= PREV =================
async function goPrev() {
  if (isLoading) return;

  try {
    showLoading();

    let prev = await getPrevChapter(
      currentVolume.id,
      currentChapter.chapter_number
    );

    if (prev) {
      currentChapter = prev;
    } else {
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
      currentChapter = data[0];
    }

    render();
  } catch (err) {
    console.error("PREV ERROR:", err);
  } finally {
    hideLoading(); // 🔥 PASTI KEJALAN
  }
}

// ================= NAV =================
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

// ================= BACK =================
function goHome() {
  window.location.href = "index.html";
}