FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    build-essential

WORKDIR /app

# ---------- FRONTEND ----------
COPY debate-frontend/package*.json ./debate-frontend/

WORKDIR /app/debate-frontend

RUN npm install

COPY debate-frontend .

RUN npm run build

# ---------- BACKEND ----------
WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]