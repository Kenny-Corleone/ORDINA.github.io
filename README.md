<div align="center">

# 🎯 ORDINA

**Your Life Order Assistant** | **Управляй своей жизнью с легкостью** | **Həyatını asanlıqla idarə et**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://kenny-corleone.github.io/ORDINA.github.io/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-ffca28?logo=firebase)](https://firebase.google.com/)

**Premium personal finance and life management suite**

[🌐 Live Demo](https://kenny-corleone.github.io/ORDINA.github.io/) • [📖 Documentation](#-features) • [🐛 Report Bug](https://github.com/Kenny-Corleone/ORDINA.github.io/issues) • [💡 Request Feature](https://github.com/Kenny-Corleone/ORDINA.github.io/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Localization](#-localization)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**ORDINA** is a modern, all-in-one web application designed to help you manage your financial life and daily tasks with ease. Built with a focus on user experience, premium design, and functionality.

### Key Highlights

✨ **Complete Financial Management** - Track expenses, manage debts, and monitor your budget  
📅 **Task & Calendar Integration** - Stay organized with integrated task management and calendar  
🌤️ **Weather Widget** - Real-time weather information with elegant design  
📰 **News Feed** - Stay informed with localized news from multiple sources  
🎵 **Radio Player** - Built-in radio player for your entertainment  
🌍 **Multi-language Support** - Available in Russian, English, and Azerbaijani  
🌓 **Dark & Light Themes** - Beautiful themes with smooth transitions  
📱 **Fully Responsive** - Optimized for all devices from mobile to desktop

---

## ✨ Features

### 💰 Financial Management

- **Expense Tracking** - Track daily, monthly, and recurring expenses
- **Debt Management** - Monitor and manage your debts with payment tracking
- **Category Analysis** - Visual insights into spending patterns
- **Currency Support** - Switch between AZN and USD
- **Recurring Expenses** - Automate tracking of monthly subscriptions and bills

### 📝 Task Management

- **Daily Tasks** - Focus on today's priorities
- **Monthly Tasks** - Plan ahead for the month
- **Long-term Goals** - Track yearly objectives
- **Task Status** - Mark tasks as done, pending, or in progress
- **Deadline Tracking** - Never miss important deadlines

### 📅 Calendar

- **Event Management** - Create and manage calendar events
- **Task Integration** - View tasks alongside events
- **Multiple Categories** - Organize events by type (birthdays, meetings, etc.)
- **Visual Overview** - Monthly grid view with color-coded events

### 🌤️ Weather Widget

- **Real-time Data** - Current weather conditions via OpenWeatherMap API
- **Location Support** - Automatic location detection or manual city search
- **Beautiful Design** - Compact, elegant widget with date/time display
- **Multi-language** - Weather descriptions in your preferred language

### 📰 News Widget

- **RSS Feed Integration** - News from multiple reliable sources
- **Category Filtering** - Filter by Technology, Business, Science, Sports, Health, Entertainment
- **Localized Content** - News in your selected language (Russian, English, Azerbaijani)
- **Search Functionality** - Search through news articles
- **Modern UI** - Clean, readable news cards with images

### 🎵 Radio Player

- **AzerbaiJazz Radio** - Built-in jazz radio streaming
- **Interactive Equalizer** - Visual audio feedback with animated bars
- **Play/Pause Control** - Keyboard shortcut support (Space)
- **Elegant Design** - Premium glassmorphism style

### 🛠️ Additional Tools

- **Calculator** - Quick access calculator modal
- **Shopping List** - Create and manage shopping lists
- **Currency Converter** - Automatic currency conversion
- **Export/Import** - Data portability

---

## 🛠️ Tech Stack

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Advanced styling with CSS variables, gradients, animations
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - No framework dependencies, pure performance
- **Font Awesome** - Icon library
- **Google Fonts** - Poppins, Space Grotesk, JetBrains Mono

### Backend & Services

- **Firebase** - Authentication, Firestore database, hosting
- **OpenWeatherMap API** - Weather data
- **RSS Feeds** - News aggregation (Lenta.ru, Habr, BBC, CNN, etc.)
- **Zeno.fm** - Radio streaming

### Design

- **Glassmorphism** - Modern glass effect design
- **Gradient Accents** - Premium color gradients
- **Dark Theme** - Complete dark mode support
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - CSS transitions and keyframes

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (for authentication and database)
- OpenWeatherMap API key (for weather widget)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Kenny-Corleone/ORDINA.github.io.git
cd ORDINA.github.io
```

2. **Configure Firebase** (Optional - if using local development)
   - Create a Firebase project
   - Copy your Firebase config to the app
   - Enable Authentication and Firestore

3. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

### GitHub Pages

The application is already deployed and available at:
**https://kenny-corleone.github.io/ORDINA.github.io/**

No installation needed - just visit the URL and start using!

---

## 📖 Usage

### First Time Setup

1. **Sign In** - Use Google authentication or email/password
2. **Select Language** - Choose from Russian, English, or Azerbaijani
3. **Set Currency** - Toggle between AZN and USD
4. **Choose Theme** - Switch between light and dark modes

### Daily Workflow

1. **Dashboard** - View your financial overview and statistics
2. **Add Expenses** - Record daily purchases and bills
3. **Manage Debts** - Track loan payments and debt reduction
4. **Tasks** - Create and complete daily/monthly tasks
5. **Calendar** - Schedule events and important dates

### Tips

- 📊 Use the dashboard to monitor spending trends
- 🔔 Set up recurring expenses for automatic tracking
- 📅 Sync tasks with calendar events for better organization
- 🌐 Change language to see localized news content
- 🎨 Customize your experience with theme selection

---

## 🌍 Localization

ORDINA supports three languages:

| Language | Code | Status |
|----------|------|--------|
| Русский | `ru` | ✅ Complete |
| English | `en` | ✅ Complete |
| Azərbaycan | `az` | ✅ Complete |

### Translated Elements

- ✅ All UI elements
- ✅ Month and weekday names
- ✅ Weather descriptions
- ✅ News content (localized RSS sources)
- ✅ Error messages
- ✅ Toast notifications

---

## 📸 Screenshots

<div align="center">

### Dark Theme Dashboard
![Dark Theme](screenshots/dark-dashboard.png)

### Light Theme
![Light Theme](screenshots/light-theme.png)

### Mobile View
![Mobile](screenshots/mobile-view.png)

</div>

---

## 🎨 Design Philosophy

ORDINA is built with a focus on:

- **Minimalism** - Clean, uncluttered interface
- **Premium Feel** - High-quality design elements
- **Accessibility** - Readable fonts, good contrast, keyboard navigation
- **Performance** - Fast loading, smooth animations
- **Responsiveness** - Works perfectly on all screen sizes

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - Open an issue describing the problem
- 💡 **Suggest Features** - Share your ideas for improvement
- 📝 **Improve Documentation** - Help make docs better
- 🌍 **Add Translations** - Help translate to more languages
- 🎨 **Design Improvements** - Suggest UI/UX enhancements
- ⚡ **Performance** - Optimize code and loading times

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Kenny Corleone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Firebase** - Backend infrastructure
- **OpenWeatherMap** - Weather API
- **RSS Feed Providers** - News content sources
- **Font Awesome** - Icon library
- **Google Fonts** - Beautiful typography
- **Tailwind CSS** - Utility framework
- All contributors and users ❤️

---

## 📞 Contact & Support

- **GitHub**: [@Kenny-Corleone](https://github.com/Kenny-Corleone)
- **Repository**: [ORDINA.github.io](https://github.com/Kenny-Corleone/ORDINA.github.io)
- **Live Site**: [kenny-corleone.github.io/ORDINA.github.io](https://kenny-corleone.github.io/ORDINA.github.io/)
- **Issues**: [Report a bug](https://github.com/Kenny-Corleone/ORDINA.github.io/issues)

---

<div align="center">

**Made with ❤️ for better life management**

⭐ Star this repo if you find it helpful!

[⬆ Back to Top](#-ordina)

</div>

