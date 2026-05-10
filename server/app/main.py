from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.clothing import router as clothing_router
from app.api.routes.health import router as health_router
from app.core.config import settings
from app.db.database import create_db_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix=settings.API_PREFIX)
    app.include_router(clothing_router, prefix=settings.API_PREFIX)

    return app


app = create_app()
