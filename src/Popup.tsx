import { useEffect, useState, useRef, useCallback } from "react"
import { fetchWordWithOpenRouter } from "./api/openRouter"
import "./App.css"

type Word = {
  word: string
  translation: string
  partOfSpeech: string
  examples: string[]
}

const STORAGE_KEYS = {
  HISTORY: "history",
  DAILY: "dailyWord"
}

export default function Popup() {
  const [current, setCurrent] = useState<Word | null>(null)
  const [history, setHistory] = useState<Word[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const getFromStorage = (key: string): Promise<Record<string, unknown>> =>
    new Promise((resolve) => chrome.storage.local.get({ [key]: null }, resolve))

  const setToStorage = (data: Record<string, unknown>): void =>
    void chrome.storage.local.set(data)

  const removeFromStorage = (key: string): void =>
    void chrome.storage.local.remove(key)

  const fetchRandomWord = async (): Promise<string | null> => {
    const res = await fetch("https://random-word-api.herokuapp.com/word?number=1")
    if (!res.ok) return null
    const [word] = await res.json()
    return word
  }

  const isSaved = useCallback((word: Word | null): boolean =>
    !!word && history.some((w) => w.word === word.word)
  , [history])

  const updateDailyWord = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const random = await fetchRandomWord()
      if (!random) throw new Error("Помилка отримання слова")

      const data = await fetchWordWithOpenRouter(random)
      const word: Word = { word: random, ...data }

      setCurrent(word)
      setToStorage({ [STORAGE_KEYS.DAILY]: word })
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("Невідома помилка")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const scheduleMidnightUpdate = useCallback(() => {
    const now = new Date()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    const msToMidnight = midnight.getTime() - now.getTime()

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void updateDailyWord().then(() => {
        scheduleMidnightUpdate()
      })
    }, msToMidnight)
  }, [updateDailyWord])

  const loadHistory = useCallback(async () => {
    const res = await getFromStorage(STORAGE_KEYS.HISTORY)
    const loaded = res[STORAGE_KEYS.HISTORY]
    if (Array.isArray(loaded)) {
      setHistory(loaded as Word[])
    }
  }, [])

  const saveToHistory = useCallback((word: Word) => {
    if (isSaved(word)) return
    const updated = [...history, word].slice(-100)
    setToStorage({ [STORAGE_KEYS.HISTORY]: updated })
    setHistory(updated)
  }, [history, isSaved])

  const removeFromHistory = useCallback((word: Word) => {
    const updated = history.filter((w) => w.word !== word.word)
    setToStorage({ [STORAGE_KEYS.HISTORY]: updated })
    setHistory(updated)
  }, [history])

  const toggleSave = () => {
    if (!current) return
    if (isSaved(current)) {
      removeFromHistory(current)
    } else {
      saveToHistory(current)
    }
  }

  const clearHistory = () => {
    removeFromStorage(STORAGE_KEYS.HISTORY)
    setHistory([])
    setShowAllHistory(false)
  }

  useEffect(() => {
    getFromStorage(STORAGE_KEYS.DAILY).then((res) => {
      const word = res[STORAGE_KEYS.DAILY]
      if (word && typeof word === "object") {
        setCurrent(word as Word)
      } else {
        updateDailyWord()
      }
    })

    loadHistory()
    scheduleMidnightUpdate()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [loadHistory, updateDailyWord, scheduleMidnightUpdate])

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
            <p><em>{current.partOfSpeech}</em></p>
            <p><strong>Переклад:</strong> {current.translation}</p>
            <p><strong>Приклади:</strong></p>
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
                <button onClick={() => setShowAllHistory((prev) => !prev)}>
                  {showAllHistory ? "Сховати" : "Показати більше"}
                </button>
              )}
              <button onClick={clearHistory} className="clear-btn">
                Очистити історію
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
