![wankilogo](https://user-images.githubusercontent.com/48199873/126626393-926f86d8-22db-430b-b079-6c8545dc20d3.png)
---
  
Wanki is an unofficial port of the already well known [Anki](https://apps.ankiweb.net/) and [AnkiDroid](https://github.com/ankidroid/Anki-Android) open source spaced repetition flashcard system into JavaScript. 
They support Windows, Mac, Linux and Android. The iOS Version is not open sourced. [AnkiWeb](https://ankiweb.net/about) is already a web version of Anki, but it requires online connection and has a fairly limited feature set, plus is closed source.

[Try it out: wanki.netlify.app](https://wanki.netlify.app/)

- [📣 Features](#-future-features)
- [👀 Screenshots](#-screenshots)
- [👏 Motivation for Wanki](#-motivation-for-wanki)
- [👨‍🏫 What's the difference?](#-whats-the-difference)
- [✍️ To-do's](#-to-dos)
- [⛏️ Development notes](#-development-notes)
- [🤲 Contribution](#-contribution)
  
---

#### 📣 (Future) Features

* Offline first
* Dark/ Light mode
* Installable as a Progressive Web App
* Working with existing [Shared Anki Decks](https://ankiweb.net/shared/decks/)
* Seamless start reviewing direct in the browser
* Use of modern JavaScript features
  
#### 👀 Screenshots
![githubheader](https://user-images.githubusercontent.com/48199873/126624785-3fc5af27-0aca-44c5-913e-2f3adb4a20d8.png)

#### 👏 Motivation for Wanki

The code basis for Anki and AnkiDroid are python, rust or java. However, Wanki is a **proof of concept** of porting the official software into JavaScript with 100% offline support. And as it is a served online web page, updates are rolled out immediately when connected to the internet.

#### 👨‍🏫 What's the difference?
  
Wanki is not bound to any operating system, and that's why it looks and feels the same on every platform. Currently, it is in initial development and lacks many main features.

---

#### ✍️ To-do's

- [x] Installable PWA
- [x] Import Anki files
- [ ] Basic review functionality
- [ ] Media overview
- [ ] Card overview
- [ ] Card Editor
- [ ] Statistics
- [ ] Replace all mock UI entries with functionality
- [ ] I18n, localize in different languages
- [ ] Hand-free mode
- [ ] Add-on support
- [ ] Anki file export
- [ ] Online sync to different devices
- [ ] Desktop adjustments
- [ ] Introducing new features

---

#### ⛏️ Development notes

This project uses

Framework: [Vue 3](https://v3.vuejs.org) with [Vite](https://vitejs.dev/)

Styling: [tailwind](https://tailwindcss.com/)

Code style: [eslint](https://eslint.org/), [prettier](https://prettier.io/) and [stylelint](https://stylelint.io/)

Database: [dexie.js](https://dexie.org/)

For import [sqllite.js](https://sql.js.org/#/) and for zipping [fflate](https://github.com/101arrowz/fflate)

Simply pull the repository and run 
````bash
npm install
````
or
````bash
yarn install
````

After installed, run
````bash
npm run dev
````
or
````bash
yarn dev
````
and go to `http://localhost:3000`

---

#### 🤲 Contribution

**First, thanks if you're considering contributing!** But as my resources are limited to work on this project, and it is still not published to the public as Wanki is still a proof of concept, issues about bugs aren't currently helpful until the first release. However, improvements in form of pull requests are welcome 💮
