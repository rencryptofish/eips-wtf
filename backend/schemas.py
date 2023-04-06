from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel


class EIPContributor(BaseModel):
    email: str
    name: str


class EIPDiff(BaseModel):
    eip: int


class EIPCommit(BaseModel):
    hexsha: str
    committed_datetime: datetime
    authored_datetime: datetime
    message: str
    author: EIPContributor
    eip_diffs: List[EIPDiff]


class EIP(BaseModel):
    eip: int
    title: str
    author: str
    status: str
    type: str
    category: Optional[str]
    created: date
    requires: List[int]
    last_call_deadline: Optional[date]
    content: str
