from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Commit(Base):
    __tablename__ = "commit"
    id = Column(Integer, primary_key=True)
    author = Column(String(50))
    message = Column(String(200))
    datetime = Column(DateTime)

class EIPDiff()
