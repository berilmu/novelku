const SUPABASE_URL = "https://jdsremmqjkyzmglppgfo.supabase.co";
const SUPABASE_KEY = "sb_publishable_p0HMWXw62gI7gzzV6qt_Ig_BJcthblo";

function headers() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
  };
}
