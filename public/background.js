function getNextMidnight() {
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime()
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("updateWord", {
    when: getNextMidnight(),
    periodInMinutes: 1440
  })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updateWord") {
    chrome.storage.local.get("dailyWord", (res) => {
      fetch(chrome.runtime.getURL("words.json")) 
        .then(r => r.json())
        .then(words => {
          const filtered = words.filter(w => w.word !== res.dailyWord?.word)
          const newWord = filtered[Math.floor(Math.random() * filtered.length)]
          chrome.storage.local.set({ dailyWord: newWord })
        })
    })
  }
})
