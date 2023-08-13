from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel


class EIPDiff(BaseModel):
    hexsha: str
    eip: int


class EIPCommit(BaseModel):
    hexsha: str
    committed_datetime: datetime
    authored_datetime: datetime
    message: str
    author_email: str
    author_name: str
    eip_diffs: List[EIPDiff]


class EIP(BaseModel):
    eip: int
    title: str
    author: str
    status: str
    type: str
    discussion: Optional[str]
    discussion_count: Optional[int]
    category: Optional[str]
    created: date
    requires: List[int]
    last_call_deadline: Optional[date]
    content: str
