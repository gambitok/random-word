import { useEffect, useState, useRef } from "react"
import { fetchWordWithOpenRouter } from "./api/openRouter"
import "./App.css"

type Word = {
  word: string
  translation: string
  partOfSpeech: string
  examples: string[]
}

export default function Popup() {
  const [current, setCurrent] = useState<Word | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Word[]>([])
  const [showAllHistory, setShowAllHistory] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const loadHistory = () => {
    chrome.storage.local.get("history", (res) => {
      setHistory(res.history || [])
    })
  }

  const saveToHistory = (word: Word) => {
    if (history.find((w) => w.word === word.word)) return
    const updated = [...history, word].slice(-100)
    chrome.storage.local.set({ history: updated })
    setHistory(updated)
  }

  const removeFromHistory = (word: Word) => {
    const updated = history.filter((w) => w.word !== word.word)
    chrome.storage.local.set({ history: updated })
    setHistory(updated)
  }

  const isSaved = (word: Word | null) =>
    word && history.some((w) => w.word === word.word)

  const toggleSave = () => {
    if (!current) return
    if (isSaved(current)) {
      removeFromHistory(current)
    } else {
      saveToHistory(current)
    }
  }

  const fetchRandomWord = async (): Promise<string | null> => {
    const res = await fetch("https://random-word-api.herokuapp.com/word?number=1")
    if (!res.ok) return null
    const [word] = await res.json()
    return word || null
  }

  const updateDailyWord = async () => {
    setLoading(true)
    setError(null)
    try {
      const random = await fetchRandomWord()
      if (!random) throw new Error("Помилка отримання випадкового слова")

      const data = await fetchWordWithOpenRouter(random)
      const word: Word = { word: random, ...data }

      setCurrent(word)
      chrome.storage.local.set({ dailyWord: word })
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("Невідома помилка")
      }
    }
    setLoading(false)
  }

  const scheduleMidnightUpdate = () => {
    const now = new Date()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const msToMidnight = midnight.getTime() - now.getTime()

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateDailyWord()
      scheduleMidnightUpdate()
    }, msToMidnight)
  }

  useEffect(() => {
    chrome.storage.local.get("dailyWord", (res) => {
      if (res.dailyWord) {
        setCurrent(res.dailyWord)
      } else {
        updateDailyWord()
      }
    })
    loadHistory()
    scheduleMidnightUpdate()
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const shortHistory = showAllHistory ? history : history.slice(-5)

  return (
    <div>
      {loading && <p>Завантаження...</p>}
      {error && (
        <p className="error">
          ⚠️ {error} <button onClick={updateDailyWord}>Спробувати ще</button>
        </p>
      )}

      {current && !loading && (
        <>
          <div className="card">
            <h3>{current.word}</h3>
            <p>
              <em>{current.partOfSpeech}</em>
            </p>
            <p>
              <strong>Переклад:</strong> {current.translation}
            </p>
            <p>
              <strong>Приклади:</strong>
            </p>
            <ul>
              {current.examples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
            <div className="buttons">
              <button onClick={updateDailyWord}>🔄 Інше слово</button>
              <button onClick={toggleSave}>
                {isSaved(current) ? "❌ Видалити" : "💾 Зберегти"}
              </button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="history">
              <h4>📜 Історія</h4>
              <ul style={{ fontSize: "0.9em" }}>
                {[...shortHistory].reverse().map((h, i) => (
                  <li key={i}>
                    {h.word} — <i>{h.translation}</i>
                  </li>
                ))}
              </ul>
              {history.length > 5 && (
                <button onClick={() => setShowAllHistory((p) => !p)}>
                  {showAllHistory ? "Сховати" : "Показати більше"}
                </button>
              )}
              <button
                onClick={() => {
                  chrome.storage.local.remove("history")
                  setHistory([])
                  setShowAllHistory(false)
                }}
                className="clear-btn"
              >
                Очистити історію
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
