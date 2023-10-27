import pandas as pd
from fastapi import Depends, FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
from peewee import fn

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


@app.get("/eip-by-status/{status}")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_eip_by_status(status: str, _=Depends(open_close_db)):
    items = list(
        EIP.select(
            EIP.eip,
            EIP.title,
            EIP.status,
            EIP.category,
            EIP.author,
            EIP.type,
            EIP.created,
            EIP.requires,
            EIP.last_call_deadline,
        )
        .where(fn.Lower(EIP.status) == status.lower())
        .dicts()
    )

    return {"message": "success", "data": items}


@app.get("/eip-diffs-per-month-category/{category}")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_eip_diffs(category: str, _=Depends(open_close_db)):
    query = EIPDiffsPerMonthView.select(
        EIPDiffsPerMonthView.month,
        fn.Lower(EIPDiffsPerMonthView.category).alias("category"),
        EIPDiffsPerMonthView.count,
    )
    items = list(query.dicts())

    # Convert to a dataframe and pivot (only get complete months)
    df = (
        pd.DataFrame(items)
        .pivot(index="month", columns="category", values="count")
        .fillna(0)
        .astype(int)
    )[:-1]
    if category.lower() != "all":
        df = df[[category.lower()]]
    items = df.reset_index().to_dict(orient="records")

    return {"message": "success", "data": items}


@app.get("/eip-by-category-status/{category}/{status}")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_eip_by_category_status(
    category: str, status: str, _=Depends(open_close_db)
):
    if category.lower() == "all":
        query = EIP.select(
            EIP.eip,
            EIP.title,
            EIP.status,
            EIP.category,
            EIP.author,
            EIP.type,
            EIP.created,
            EIP.requires,
            EIP.last_call_deadline,
        ).where((fn.Lower(EIP.status) == status.lower()))
    else:
        query = EIP.select(
            EIP.eip,
            EIP.title,
            EIP.status,
            EIP.category,
            EIP.author,
            EIP.type,
            EIP.created,
            EIP.requires,
            EIP.last_call_deadline,
        ).where(
            (fn.Lower(EIP.status) == status.lower())
            & (fn.Lower(EIP.category) == category.lower())
        )
    items = list(query.dicts())

    return {"message": "success", "data": items}


@app.get("/latest-eip-diffs-by-category/{category}")
@cache(expire=CACHE_EXPIRE_SECONDS)
async def get_latest_commits_by_category(category: str, _=Depends(open_close_db)):
    if category.lower() == "all":
        query = (
            EIPDiffsWithCommitsView.select()
            .order_by(EIPDiffsWithCommitsView.committed_datetime.desc())
            .limit(50)
        )
    else:
        query = (
            EIPDiffsWithCommitsView.select()
            .where(fn.Lower(EIPDiffsWithCommitsView.category) == category.lower())
            .order_by(EIPDiffsWithCommitsView.committed_datetime.desc())
            .limit(50)
        )
    items = list(query.dicts())
    return {"message": "success", "data": items}


def run():
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run()
