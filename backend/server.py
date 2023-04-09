from fastapi import FastAPI, Depends
from db import get_db_conn, EIP
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache

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


@app.get("/items")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_items(_=Depends(open_close_db)):
    items = list(EIP.select().dicts())
    return items


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
