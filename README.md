# BeProductive – Chrome Productivity Tracker

## Overview

BeProductive is a productivity tracking web application with a Chrome extension that helps users stay focused during work or study sessions. The application allows users to create a timed productivity session, define which websites are considered productive, and automatically track browsing activity using the Chrome Tabs API.

During a session, the extension continuously monitors the active browser tab and classifies the user's browsing time as either **productive** or **unproductive** based on the configured list of productive domains. When the session ends (either automatically when the timer expires or manually by the user), a detailed analytics report is generated to help users understand how they spent their time.

---

## Features

* ⏱️ Create timed productivity sessions.
* 🌐 Configure a custom list of productive domains.
* 📊 Automatically track active browser tabs using the Chrome Tabs API.
* ✅ Measure productive browsing time.
* ❌ Measure unproductive browsing time.
* 🔄 Count distractions by tracking switches to unproductive websites.
* 📈 Display session analytics after every session.
* 🛑 End sessions manually or automatically when the timer expires.

---

## Tech Stack

### Frontend

* Vue.js

### Backend

* Express.js

### Browser Extension

* Chrome Extension
* Chrome Tabs API

---

## How It Works

1. Start a new productivity session.
2. Choose the desired session duration.
3. Configure the list of productive domains (for example: `github.com`, `stackoverflow.com`, `leetcode.com`).
4. Start the session.
5. The Chrome extension continuously monitors the currently active browser tab.
6. Every visited domain is classified as:

   * **Productive**
   * **Unproductive**
7. Time spent on each category is recorded throughout the session.
8. When the timer finishes or the user clicks **Stop Session**, an analytics report is generated.

---

## Session Analytics

At the end of every session, the application displays:

* **Total Productive Time**
* **Total Unproductive Time**
* **Total Session Duration**
* **List of Unproductive Domains Visited**
* **Total Unproductive Jumps** (number of times the user switched to an unproductive website)

Example:

```text
Total Productive Time: 45 min 12 sec

Total Unproductive Time: 14 min 48 sec

Session Duration: 60 min

List of Unproductive Domains Visited:
- youtube.com
- instagram.com
- reddit.com

Total Unproductive Jumps: 7
```

---



## Use Cases

* Students preparing for exams
* Developers tracking coding sessions
* Remote employees
---

## Future Improvements

* Daily and weekly productivity reports
* Productivity trends and charts
* Export analytics as PDF or CSV
* Notifications when spending too much time on distracting websites

---

