async function loadNovels() {
  const novels = await getNovels();
  const container = document.getElementById("novel-list");

  container.innerHTML = "";

  novels.forEach(novel => {
    const div = document.createElement("div");
    div.className = "novel";

    div.innerHTML = `
      <h2>${novel.title}</h2>
      <p>${novel.description || ""}</p>
      <button onclick="startReading(${novel.id})">Mulai Baca</button>
    `;

    container.appendChild(div);
  });
}

function startReading(id) {
  window.location.href = `reader.html?novel=${id}`;
}

loadNovels();