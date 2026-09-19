FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-prod.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements-prod.txt && \
    pip cache purge

# REMOVE build tools after install
RUN apt-get purge -y build-essential && \
    apt-get autoremove -y

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]