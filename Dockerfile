FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY assets/ ./assets/
COPY seed_hod.py ./seed_hod.py

RUN mkdir -p /app/uploads

WORKDIR /app/backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD python -c "from urllib.request import urlopen; urlopen('http://127.0.0.1:8000/health', timeout=2)"

CMD ["sh", "-c", "if [ \"${SEED_HOD:-false}\" = \"true\" ]; then python /app/seed_hod.py --non-interactive || exit $?; fi; exec uvicorn main:app --host 0.0.0.0 --port 8000"]
