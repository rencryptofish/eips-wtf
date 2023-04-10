from fastapi import Depends, FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
from peewee import JOIN, fn

from eips.db import (
    EIP,
    Commit,
    EIPDiff,
    EIPDiffsPerMonthView,
    EIPDiffsWithCommitsView,
    get_db_conn,
)

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
@cache(expire=CACHE_EXPIRE_SECONDS)
async def root():
    return {"message": "gm"}


@app.get("/eip/{eip_id}")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_eip(eip_id: int, _=Depends(open_close_db)):
    eip = EIP.get_or_none(EIP.eip == eip_id)
    if eip:
        return {"message": "success", "data": eip.__data__}
    return {"message": "EIP not found"}


@app.get("/categories")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_categories(_=Depends(open_close_db)):
    categories = list(EIP.select(EIP.category).distinct().dicts())
    return {"message": "success", "data": categories}


@app.get("/category/{category}")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_category(category: str, _=Depends(open_close_db)):
    items = list(EIP.select().where(fn.Lower(EIP.category) == category.lower()).dicts())
    return {"message": "success", "data": items}


@app.get("/latest-eip-diffs")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_latest_commits(_=Depends(open_close_db)):
    query = (
        EIPDiffsWithCommitsView.select()
        .order_by(EIPDiffsWithCommitsView.committed_datetime.desc())
        .limit(50)
    )
    items = list(query.dicts())
    return {"message": "success", "data": items}


@app.get("/category-eip-diffs/{category}")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_category_eip_diffs(category: str, _=Depends(open_close_db)):
    query = (
        EIPDiffsWithCommitsView.select()
        .join(Commit, on=(EIPDiffsWithCommitsView.hexsha == Commit.hexsha))
        .where(fn.Lower(EIPDiffsWithCommitsView.category) == category.lower())
        .order_by(EIPDiffsWithCommitsView.committed_datetime.desc())
    )
    items = list(query.dicts())
    return {"message": "success", "data": items}


@app.get("/eip-diffs-per-month")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_eip_diffs(_=Depends(open_close_db)):
    query = EIPDiffsPerMonthView.select()
    items = list(query.dicts())
    return {"message": "success", "data": items}


def run():
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()
