const params = new URLSearchParams(location.search);
const novelId = params.get("novel");

const URL = "https://YOUR_PROJECT.supabase.co/rest/v1";
const KEY = "YOUR_ANON_KEY";

let volume, chapter;

// helper fetch
async function q(path) {
  const r = await fetch(URL + path, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
  });
  return r.json();
}

// init
async function init() {
  volume = (await q(`/volumes?novel_id=eq.${novelId}&order=volume_number.asc&limit=1`))[0];
  chapter = (await q(`/chapters?volume_id=eq.${volume.id}&order=chapter_number.asc&limit=1`))[0];

  render();
}

// render
function render() {
  document.getElementById("volume").textContent = volume.title;
  document.getElementById("chapter").textContent = chapter.title;
  document.getElementById("content").innerHTML = marked.parse(chapter.content);

  window.scrollTo(0, 0);

  updateNav();
}

// next
async function next() {
  let n = (await q(`/chapters?volume_id=eq.${volume.id}&chapter_number=gt.${chapter.chapter_number}&order=chapter_number.asc&limit=1`))[0];

  if (n) {
    chapter = n;
  } else {
    let v = (await q(`/volumes?novel_id=eq.${novelId}&volume_number=gt.${volume.volume_number}&order=volume_number.asc&limit=1`))[0];
    if (!v) return;

    volume = v;
    chapter = (await q(`/chapters?volume_id=eq.${volume.id}&order=chapter_number.asc&limit=1`))[0];
  }

  render();
}

// prev
async function prev() {
  let p = (await q(`/chapters?volume_id=eq.${volume.id}&chapter_number=lt.${chapter.chapter_number}&order=chapter_number.desc&limit=1`))[0];

  if (p) {
    chapter = p;
  } else {
    let v = (await q(`/volumes?novel_id=eq.${novelId}&volume_number=lt.${volume.volume_number}&order=volume_number.desc&limit=1`))[0];
    if (!v) return;

    volume = v;
    chapter = (await q(`/chapters?volume_id=eq.${volume.id}&order=chapter_number.desc&limit=1`))[0];
  }

  render();
}

// nav state
async function updateNav() {
  let n = (await q(`/chapters?volume_id=eq.${volume.id}&chapter_number=gt.${chapter.chapter_number}&limit=1`))[0];
  let v = (await q(`/volumes?novel_id=eq.${novelId}&volume_number=gt.${volume.volume_number}&limit=1`))[0];

  let p = (await q(`/chapters?volume_id=eq.${volume.id}&chapter_number=lt.${chapter.chapter_number}&limit=1`))[0];
  let pv = (await q(`/volumes?novel_id=eq.${novelId}&volume_number=lt.${volume.volume_number}&limit=1`))[0];

  document.getElementById("next").disabled = !n && !v;
  document.getElementById("prev").disabled = !p && !pv;
}

// back
function goHome() {
  location.href = "index.html";
}

// event
document.getElementById("next").onclick = next;
document.getElementById("prev").onclick = prev;

init();