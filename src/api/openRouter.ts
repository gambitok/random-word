const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || "gpt-4o-mini"

export async function fetchWordWithOpenRouter(word: string) {
  const prompt = `
  Please provide the following information about the English word "${word}":
  1. Ukrainian translation (one or two words)
  2. Part of speech (noun, verb, adjective, etc.)
  3. Example sentences (3 examples) demonstrating usage.
  Format the response as JSON with keys: translation, partOfSpeech, examples (array of strings).
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
    return parsed // { translation, partOfSpeech, examples }
  } catch {
    throw new Error("Failed to parse OpenRouter response JSON")
  }
}
