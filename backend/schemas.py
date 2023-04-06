from datetime import datetime, date

from pydantic import BaseModel
from typing import Optional, List


class Author(BaseModel):
    email: str
    name: str


class Commit(BaseModel):
    hexsha: str
    committed_datetime: datetime
    authored_datetime: datetime
    message: str
    author: Author


class EIPDiff(BaseModel):
    eip: int
    author: Author


class EIP(BaseModel):
    eip: int
    title: str
    author: str
    status: str
    type: str
    category: Optional[str]
    created: date
    requires: List[int]
    content: str
