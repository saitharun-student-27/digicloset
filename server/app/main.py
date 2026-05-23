from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes.clothing import router as clothing_router
from app.api.routes.health import router as health_router
from app.api.routes.outfits import router as outfits_router
from app.api.routes.ai import router as ai_router
from app.api.routes.suggestions import router as suggestions_router
from app.api.routes.auth import router as auth_router
from app.core.config import settings
from app.db.database import create_db_tables
from app.utils.upload import ensure_upload_dir


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_tables()
    yield


def create_app() -> FastAPI:
    ensure_upload_dir()
    docs_url = "/docs" if settings.enable_api_docs else None
    redoc_url = "/redoc" if settings.enable_api_docs else None
    openapi_url = "/openapi.json" if settings.enable_api_docs else None

    app = FastAPI(
        title=settings.APP_NAME,
        lifespan=lifespan,
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix=settings.API_PREFIX)
    app.include_router(auth_router, prefix=settings.API_PREFIX)
    app.include_router(clothing_router, prefix=settings.API_PREFIX)
    app.include_router(outfits_router, prefix=settings.API_PREFIX)
    app.include_router(ai_router, prefix=settings.API_PREFIX)
    app.include_router(suggestions_router, prefix=settings.API_PREFIX)
    if settings.should_mount_local_uploads:
        app.mount(
            settings.UPLOAD_URL_PREFIX,
            StaticFiles(directory=settings.upload_dir_path),
            name="uploads",
        )

    return app


app = create_app()
