 # ORDINA

**Personal Command Center** - Premium personal finance and life management suite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kenny-Corleone/ORDINA.github.io.git
   cd ORDINA.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Visit `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deployment

This project is configured for **GitHub Pages** with automatic deployment via GitHub Actions.

**Manual deployment options:**
- **GitHub Pages** - Automatically deploys on push to `main`
- **Netlify** - Connect your GitHub repo or drag and drop `dist/` folder
- **Vercel** - Connect your GitHub repo
- **Firebase Hosting** - Run `firebase deploy` after build

## 📁 Project Structure

```
ORDINA.github.io/
├── index.html          # Main HTML entry point
├── src/                # Source files
│   ├── main.js         # JavaScript entry point
│   ├── styles/         # CSS files
│   └── js/             # JavaScript modules
│       ├── app.js      # Main application logic
│       ├── firebase.js # Firebase configuration
│       ├── i18n.js     # Internationalization
│       ├── utils.js    # Utility functions
│       ├── weather.js  # Weather widget
│       └── news.js     # News widget
├── assets/             # Static assets
│   ├── favicons/       # Favicon files
│   └── *.png          # Logo files
├── locales/            # Translation files
│   ├── locale-ru.json
│   ├── locale-en.json
│   └── locale-az.json
├── dist/               # Production build (generated)
├── .github/            # GitHub Actions workflows
├── package.json        # Project dependencies
├── vite.config.js      # Vite configuration
└── LICENSE            # MIT License
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally

### Tech Stack

- **Vite** - Fast build tool and dev server
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - ES6+ modules, no framework
- **Firebase** - Authentication and Firestore database
- **Chart.js** - Data visualization
- **Particles.js** - Background animations

## 🌍 Localization

The app supports three languages:
- Russian (`ru`)
- English (`en`)
- Azerbaijani (`az`)

Translation files are located in `locales/` directory.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: https://kenny-corleone.github.io/ORDINA.github.io/
- **Repository**: https://github.com/Kenny-Corleone/ORDINA.github.io
- **Issues**: https://github.com/Kenny-Corleone/ORDINA.github.io/issues

---

Made with ❤️ for better life management

