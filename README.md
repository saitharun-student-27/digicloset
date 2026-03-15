# DigiCloset 👗

> AI-Powered Digital Wardrobe & Virtual Try-On — built with React + Flask

---

## Features

- **Upload & organise** your clothing by category, color, season, and occasion
- **Outfit Generator** — random AI-mixed outfit combinations with a style score
- **Virtual Try-On** — powered by the RapidAPI Virtual Try-On API
- **Delete items** from your wardrobe
- SQLite database (zero setup required)

---

## Project Structure

```
digicloset/
├── server/                 # Flask backend
│   ├── app.py
│   ├── models/wardrobe.py  # SQLite helpers
│   ├── routes/wardrobe_routes.py
│   ├── uploads/            # Uploaded images (git-ignored)
│   ├── .env.example
│   └── requirements.txt
│
└── client/                 # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── Upload.jsx
    │   │   ├── Wardrobe.jsx
    │   │   ├── OutfitGenerator.jsx
    │   │   └── VirtualTryOn.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Closet.jsx
    │   │   ├── OutfitPage.jsx
    │   │   └── TryOnPage.jsx
    │   ├── App.jsx
    │   ├── api.js
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/digicloset.git
cd digicloset
```

### 2. Backend (Flask)

```bash
cd server

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your RAPIDAPI_KEY

# Start the server
python app.py
```

The API runs at **http://localhost:5000**

### 3. Frontend (React)

```bash
cd client
npm install
npm run dev
```

The app runs at **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload a clothing image |
| GET | `/wardrobe` | Get all clothing items |
| GET | `/wardrobe?category=Tops` | Filter by category |
| DELETE | `/wardrobe/:id` | Delete an item |
| GET | `/generate-outfit` | Get a random outfit combo |
| POST | `/tryon` | Virtual try-on via RapidAPI |

---

## Virtual Try-On Setup

1. Go to [RapidAPI – Virtual Try-On](https://rapidapi.com/apidojo/api/virtual-try-on2)
2. Subscribe (free tier available)
3. Copy your **X-RapidAPI-Key**
4. Paste it into `server/.env`:

```
RAPIDAPI_KEY=your_key_here
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Axios |
| Styling | Tailwind CSS + CSS Variables |
| Backend | Flask, Flask-CORS |
| Database | SQLite (via Python sqlite3) |
| AI API | RapidAPI Virtual Try-On v2 |

---

## Contributing

Pull requests welcome. For major changes please open an issue first.

---

## License

MIT
