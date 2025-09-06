// lib/translate.ts
const API_KEY = process.env.DEEPL_API_KEY;

const endpoint = API_KEY?.includes(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate";

export async function autoTranslate(
  text: string,
  targetLang: string,
  sourceLang = "EN"
): Promise<string> {
  if (!API_KEY) {
    console.warn("[TRANSLATE] Missing DEEPL_API_KEY");
    return text;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `DeepL-Auth-Key ${API_KEY}`,
      },
      body: new URLSearchParams({
        text,
        source_lang: sourceLang,
        target_lang: targetLang.toUpperCase(), // DeepL expects "FR", "DE", etc.
      }),
    });

    const data = await res.json();
    if (data?.translations?.[0]?.text) {
      return data.translations[0].text;
    } else {
      console.error("[TRANSLATE] Unexpected response:", data);
      return text;
    }
  } catch (err) {
    console.error("[TRANSLATE] failed:", err);
    return text; // fallback to original English
  }
}
