// Etkinlik "yaklaşan / geçmiş" kuralı — API (routes/events.js) ve SEO özeti (seo.js) aynı kuralı kullanır.
// Tarihi geçen etkinlik, panelde "yaklaşan" işaretli kalsa bile otomatik olarak geçmiş sayılır.
// Yalnızca YYYY-MM-DD biçimli tarihler karşılaştırılır; boş/serbest metin tarihler bayrağa göre kalır.
const ISO = "date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]*'";
const PASSED = `(${ISO} AND substr(date, 1, 10) < date('now', 'localtime'))`;

export const UPCOMING_WHERE = `is_upcoming = 1 AND NOT ${PASSED}`;
export const PAST_WHERE = `(is_upcoming = 0 OR ${PASSED})`;
