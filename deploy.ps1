#!/usr/bin/env pwsh
# =============================================================================
# EcoTrack AI — Google Cloud Run Deployment Script
# Usage: .\deploy.ps1
#
# Prerequisites:
#   1. gcloud CLI installed & authenticated (gcloud auth login)
#   2. gcloud config set project ecotrack-ai-499812
#   3. Docker Desktop running
#   4. Billing enabled on the GCP project
# =============================================================================

$PROJECT_ID   = "ecotrack-ai-499812"
$REGION       = "us-central1"
$BACKEND_SVC  = "ecotrack-backend"
$FRONTEND_SVC = "ecotrack-frontend"
$BACKEND_IMG  = "gcr.io/$PROJECT_ID/$BACKEND_SVC"
$FRONTEND_IMG = "gcr.io/$PROJECT_ID/$FRONTEND_SVC"

# ─── Prompt for secrets ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  EcoTrack AI — Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$GEMINI_API_KEY               = Read-Host "GEMINI_API_KEY"
$FIREBASE_API_KEY             = Read-Host "NEXT_PUBLIC_FIREBASE_API_KEY"
$FIREBASE_AUTH_DOMAIN         = Read-Host "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
$FIREBASE_PROJECT_ID          = Read-Host "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
$FIREBASE_STORAGE_BUCKET      = Read-Host "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
$FIREBASE_MESSAGING_SENDER_ID = Read-Host "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
$FIREBASE_APP_ID              = Read-Host "NEXT_PUBLIC_FIREBASE_APP_ID"
$MAPS_API_KEY                 = Read-Host "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (press Enter to skip)"

# ─── Step 0: Enable required APIs ─────────────────────────────────────────────
Write-Host ""
Write-Host "[1/7] Enabling GCP APIs..." -ForegroundColor Yellow
gcloud services enable `
  run.googleapis.com `
  cloudbuild.googleapis.com `
  containerregistry.googleapis.com `
  secretmanager.googleapis.com `
  --project=$PROJECT_ID

# ─── Step 1: Store Gemini key in Secret Manager ───────────────────────────────
Write-Host ""
Write-Host "[2/7] Storing GEMINI_API_KEY in Secret Manager..." -ForegroundColor Yellow

$secretExists = gcloud secrets describe GEMINI_API_KEY --project=$PROJECT_ID 2>&1
if ($LASTEXITCODE -ne 0) {
    gcloud secrets create GEMINI_API_KEY --replication-policy=automatic --project=$PROJECT_ID
}
$GEMINI_API_KEY | gcloud secrets versions add GEMINI_API_KEY --data-file=- --project=$PROJECT_ID

# ─── Step 2: Configure Docker for GCR ────────────────────────────────────────
Write-Host ""
Write-Host "[3/7] Authenticating Docker with GCR..." -ForegroundColor Yellow
gcloud auth configure-docker --quiet

# ─── Step 3: Build & push backend ─────────────────────────────────────────────
Write-Host ""
Write-Host "[4/7] Building & pushing backend image..." -ForegroundColor Yellow
docker build -t "${BACKEND_IMG}:latest" .\backend\
docker push "${BACKEND_IMG}:latest"

# ─── Step 4: Deploy backend to Cloud Run ──────────────────────────────────────
Write-Host ""
Write-Host "[5/7] Deploying backend to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $BACKEND_SVC `
  --image="${BACKEND_IMG}:latest" `
  --region=$REGION `
  --platform=managed `
  --allow-unauthenticated `
  --port=8080 `
  --memory=512Mi `
  --cpu=1 `
  --min-instances=0 `
  --max-instances=5 `
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" `
  --project=$PROJECT_ID

# Capture backend URL
$BACKEND_URL = gcloud run services describe $BACKEND_SVC `
  --region=$REGION `
  --project=$PROJECT_ID `
  --format="value(status.url)"

Write-Host ""
Write-Host "✅ Backend deployed: $BACKEND_URL" -ForegroundColor Green

# ─── Step 5: Build & push frontend ───────────────────────────────────────────
Write-Host ""
Write-Host "[6/7] Building & pushing frontend image..." -ForegroundColor Yellow
docker build `
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY `
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN `
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID `
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET `
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID `
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID `
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$MAPS_API_KEY `
  --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL `
  -t "${FRONTEND_IMG}:latest" `
  .\frontend\

docker push "${FRONTEND_IMG}:latest"

# ─── Step 6: Deploy frontend to Cloud Run ─────────────────────────────────────
Write-Host ""
Write-Host "[7/7] Deploying frontend to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $FRONTEND_SVC `
  --image="${FRONTEND_IMG}:latest" `
  --region=$REGION `
  --platform=managed `
  --allow-unauthenticated `
  --port=3000 `
  --memory=512Mi `
  --cpu=1 `
  --min-instances=0 `
  --max-instances=5 `
  --project=$PROJECT_ID

$FRONTEND_URL = gcloud run services describe $FRONTEND_SVC `
  --region=$REGION `
  --project=$PROJECT_ID `
  --format="value(status.url)"

# ─── Done ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  🚀 Deployment Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend : $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "  Backend  : $BACKEND_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Add $FRONTEND_URL to your Firebase authorized domains." -ForegroundColor Yellow
Write-Host ""
