# DigiCloset Server

FastAPI backend for DigiCloset.

## Setup

```powershell
cd server
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

## Health Check

```powershell
curl http://localhost:8000/api/health
```
