from fastapi import FastAPI, Depends
from db import get_db_conn, EIP

app = FastAPI()


async def open_close_db():
    db_conn = get_db_conn()
    try:
        yield
    finally:
        if not db_conn.is_closed():
            db_conn.close()


@app.get("/hello")
async def hello():
    return {"message": "Hello World"}


@app.get("/items")
async def get_items(_=Depends(open_close_db)):
    items = list(EIP.select().dicts())
    return items
