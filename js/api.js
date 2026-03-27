async function getNovels() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/novels`, { headers: headers() });
  return res.json();
}

async function getFirstVolume(novelId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/volumes?novel_id=eq.${novelId}&order=volume_number.asc&limit=1`, { headers: headers() });
  return (await res.json())[0];
}

async function getFirstChapter(volumeId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/chapters?volume_id=eq.${volumeId}&order=chapter_number.asc&limit=1`, { headers: headers() });
  return (await res.json())[0];
}

async function getNextChapter(volumeId, currentNumber) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/chapters?volume_id=eq.${volumeId}&chapter_number=gt.${currentNumber}&order=chapter_number.asc&limit=1`, { headers: headers() });
  return (await res.json())[0];
}

async function getNextVolume(novelId, currentNumber) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/volumes?novel_id=eq.${novelId}&volume_number=gt.${currentNumber}&order=volume_number.asc&limit=1`, { headers: headers() });
  return (await res.json())[0];
    }
