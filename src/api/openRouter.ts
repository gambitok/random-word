const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || "gpt-4o-mini"

export async function fetchWordWithOpenRouter(word: string) {
  const prompt = `
  Please provide the following information about the English word "${word}":
  1. Ukrainian translation — exactly one or two Ukrainian words using Cyrillic letters only, without any Latin letters or transliteration, and without spelling mistakes.
  2. Part of speech (noun, verb, adjective, etc.)
  3. Three example sentences in English showing the word in context.
  Format the response as a JSON object with keys: translation, partOfSpeech, examples (array of strings).
  `

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: "You are a helpful English tutor." },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter API error: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error("No response from OpenRouter")

  try {
    const parsed = JSON.parse(text)
    return parsed
  } catch {
    throw new Error("Failed to parse OpenRouter response JSON")
  }
}
