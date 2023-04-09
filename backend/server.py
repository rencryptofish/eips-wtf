from eips.db import EIP, get_db_conn
from fastapi import Depends, FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
from peewee import fn

CACHE_EXPIRE_SECONDS = 60 * 60  # 1 hour

app = FastAPI()


async def open_close_db():
    db_conn = get_db_conn()
    try:
        yield
    finally:
        if not db_conn.is_closed():
            db_conn.close()


# Set up the cache backend
def setup_cache():
    backend = InMemoryBackend()
    FastAPICache.init(backend, prefix="fastapi-cache")


@app.on_event("startup")
async def on_startup():
    setup_cache()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def hello():
    return {"message": "Hello World"}


@app.get("/eip/{eip_id}")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_eip(eip_id: int, _=Depends(open_close_db)):
    eip = EIP.get_or_none(EIP.eip == eip_id)
    if eip:
        return eip
    return {"message": "EIP not found"}


@app.get("/categories")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_categories(_=Depends(open_close_db)):
    categories = list(EIP.select(EIP.category).distinct().dicts())
    return categories


@app.get("/category/{category}")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_category(category: str, _=Depends(open_close_db)):
    items = list(EIP.select().where(fn.Lower(EIP.category) == category.lower()).dicts())
    return items


def run():
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()
