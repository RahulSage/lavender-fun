# 💜 Lavender Love

A premium, fully interactive romantic proposal website built with pure HTML, CSS, and Vanilla JavaScript. No backend required — works perfectly on GitHub Pages.

---

## ✨ Features

- **4-page interactive experience**: Welcome → Proposal → Compatibility Check → Invitation Card
- **Runaway NO button** — jumps away on mouse/touch approach with funny messages
- **Fake compatibility loading screen** with animated progress steps
- **Beautiful invitation card** with countdown timer, download options, and QR code
- **Canvas particle system** — floating hearts, sparkles, and glowing particles
- **Confetti burst** on YES click
- **Relationship compatibility meter** animated to 99.99%
- **Dark mode** with localStorage persistence
- **Web Audio API music** — soft romantic chord (no audio file needed)
- **Konami Code easter egg** 🎮 — try ↑↑↓↓←→←→
- **Download as PNG / PDF**, Web Share API, clipboard copy
- **QR code generator** for the invitation
- **Fully responsive** — mobile, tablet, desktop
- **Accessibility** — keyboard navigation, ARIA labels, reduced-motion support

---

## 🚀 Deploying to GitHub Pages

1. **Create a new repository** on GitHub (e.g., `lavender-fun`)
2. Push all files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Lavender Love website"
   git remote add origin https://github.com/YOUR_USERNAME/lavender-fun.git
   git push -u origin main
   ```
3. Go to **Settings → Pages** in your repository
4. Under **Source**, select `main` branch and `/ (root)` folder
5. Click **Save** — your site will be live at `https://YOUR_USERNAME.github.io/lavender-fun/`

---

## 🎨 Customising Text

Open `index.html` and change:
- **Heading on Welcome page**: `"Hello Beautiful ❤️"` → your custom greeting
- **Big question**: `"Will you go on a date with me?"` → your own question
- **Invitation body text**: find `inv-body` and `inv-message` inside `#page-invitation`
- **P.S. message**: find the `.ps-text` paragraph
- **Success messages**: find `.success-msg` elements in `#successMessages`

---

## 🖌️ Customising Colors

Edit the CSS custom properties at the top of `style.css`:

```css
:root {
  --lavender:    #E6E6FA;   /* background tint */
  --soft-purple: #B57EDC;   /* primary accent  */
  --blush:       #FFD1DC;   /* secondary accent */
  --gold:        #FFD700;   /* highlight/gold   */
}
```

Replace any hex value to instantly retheme the whole site.

---

## 🎵 Adding Your Own Music

The site uses the **Web Audio API** to generate a soft chord — no audio file needed. To use your own track instead:

1. Place an `.mp3` file in `assets/audio/` (e.g., `romantic.mp3`)
2. In `index.html`, update the `<audio>` tag:
   ```html
   <audio id="bgAudio" loop preload="none">
     <source src="assets/audio/romantic.mp3" type="audio/mpeg" />
   </audio>
   ```
3. In `script.js`, replace `startMusic()` and `stopMusic()` to use the `<audio>` element:
   ```js
   function startMusic() {
     const audio = document.getElementById('bgAudio');
     audio.play();
     state.musicPlaying = true;
     document.getElementById('musicIcon').textContent = '🔇';
   }
   function stopMusic() {
     const audio = document.getElementById('bgAudio');
     audio.pause();
     state.musicPlaying = false;
     document.getElementById('musicIcon').textContent = '🎵';
   }
   ```

---

## 💑 Replacing Date Options

Open `index.html` and find the `<select id="dateType">` element. Add, remove, or edit `<option>` elements:

```html
<option value="🌊 Beach Sunset Date">🌊 Beach Sunset Date</option>
```

The `value` attribute is what appears on the invitation card.

---

## 💻 Local Development

No build step needed — just open `index.html` in a browser. For the best experience (avoiding CORS issues with html2canvas), serve via a local server:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
# Install "Live Server" extension, right-click index.html → Open with Live Server
```

Then visit `http://localhost:8080`

---

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| Core experience | ✅ | ✅ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |
| Glassmorphism (`backdrop-filter`) | ✅ | ✅ | ✅ | ✅ |
| Web Share API | ✅ | ⚠️ limited | ✅ | ✅ |
| Download PNG/PDF | ✅ | ✅ | ✅ | ✅ |
| QR Code | ✅ | ✅ | ✅ | ✅ |

---

## 🔮 Future Enhancement Ideas

- **Animated SVG illustrations** — custom hand-drawn hearts and florals
- **Lottie animations** — for richer micro-interactions
- **Supabase backend** — store RSVP responses, send email confirmations
- **Multiple proposal themes** — switch between Lavender, Midnight Blue, Rose Gold
- **Photo upload** — attach a special photo to the invitation card
- **Animated envelope reveal** — card appears sliding out of an envelope
- **Custom domain** — connect a personal domain in GitHub Pages settings
- **Multi-language support** — i18n for the text content
- **SMS/WhatsApp share** — deep-link share buttons for messaging apps
