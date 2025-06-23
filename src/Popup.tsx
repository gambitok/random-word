import { useEffect, useState } from "react"
import { words } from "./data/words"
import type { Word } from "./data/words"

const getRandomWord = (excludeWord?: string): Word => {
  const filtered = words.filter((w) => w.word !== excludeWord)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export default function Popup() {
  const [current, setCurrent] = useState<Word | null>(null)
  const [history, setHistory] = useState<Word[]>([])
  const [showAllHistory, setShowAllHistory] = useState(false)

  // Встановити нове слово (без збереження)
  const setNewWord = (word: Word) => {
    setCurrent(word)
    chrome.storage.local.set({ dailyWord: word })
  }

  // Дізнатись, чи є слово в історії
  const isInHistory = (word: Word) => {
    return history.some((w) => w.word === word.word)
  }

  // Додати слово в історію
  const addToHistory = (word: Word) => {
    const updated = [...history, word].slice(-100) // максимум 100
    chrome.storage.local.set({ history: updated })
    setHistory(updated)
  }

  // Видалити слово з історії
  const removeFromHistory = (word: Word) => {
    const updated = history.filter((w) => w.word !== word.word)
    chrome.storage.local.set({ history: updated })
    setHistory(updated)
  }

  // Обробник кнопки зберегти/видалити
  const handleSaveOrRemove = () => {
    if (!current) return
    if (isInHistory(current)) {
      removeFromHistory(current)
    } else {
      addToHistory(current)
    }
  }

  // Наступне слово (без збереження)
  const handleNext = () => {
    const newWord = getRandomWord(current?.word)
    setNewWord(newWord)
  }

  // Завантаження зі сховища
  useEffect(() => {
    chrome.storage.local.get(["dailyWord", "history"], (res) => {
      if (res.dailyWord) {
        setCurrent(res.dailyWord)
      } else {
        const word = getRandomWord()
        setNewWord(word)
      }

      if (res.history) {
        setHistory(res.history)
      }
    })
  }, [])

  if (!current) return <p>Loading...</p>

  const visibleHistory = showAllHistory ? history : history.slice(-5)

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif", width: 280 }}>
      <h2>{current.word}</h2>
      <p>
        <strong>Переклад:</strong> {current.translation}
      </p>
      <p>
        <strong>Частина мови:</strong> {current.partOfSpeech}
      </p>
      <p>
        <strong>Приклади:</strong>
      </p>
      <ul>
        {current.examples.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>

      <button onClick={handleNext} style={{ display: 'block' }}>
        Я знаю це слово
      </button>
      <button onClick={handleSaveOrRemove} style={{ marginTop: 5 }}>
        {isInHistory(current) ? "Видалити з історії" : "Зберегти в історію"}
      </button>

      {history.length > 0 && (
        <>
          <hr />
          <p>
            <strong>Історія слів:</strong>
          </p>
          <ul
            style={{
              maxHeight: "100px",
              overflowY: "auto",
              fontSize: "0.9em",
            }}
          >
            {[...visibleHistory]
              .slice()
              .reverse()
              .map((w, i) => (
                <li key={i}>
                  {w.word} — {w.translation}
                </li>
              ))}
          </ul>

          {history.length > 5 && (
            <button
              onClick={() => setShowAllHistory(!showAllHistory)}
              style={{ marginBottom: 8 }}
            >
              {showAllHistory ? "Сховати історію" : "Показати більше"}
            </button>
          )}

          <button
            onClick={() => {
              chrome.storage.local.remove("history")
              setHistory([])
              setShowAllHistory(false)
            }}
            style={{ color: "red" }}
          >
            Очистити історію
          </button>
        </>
      )}
    </div>
  )
}
