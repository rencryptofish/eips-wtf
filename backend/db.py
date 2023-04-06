import logging
import os

from peewee import (
    SQL,
    BigIntegerField,
    BooleanField,
    CharField,
    CompositeKey,
    DateField,
    DateTimeField,
    DecimalField,
    DoubleField,
    FloatField,
    ForeignKeyField,
    IntegerField,
    Model,
    PrimaryKeyField,
    TextField,
)
from playhouse.pool import PooledPostgresqlExtDatabase
from playhouse.postgres_ext import (
    ArrayField,
    BinaryJSONField,
    DateTimeTZField,
    JSONField,
)

logger = logging.getLogger(__name__)

database = PooledPostgresqlExtDatabase(None)


def db_env_init(**kwargs):
    db_name = os.getenv("PGDATABASE")
    db_host = os.getenv("PGHOST")
    db_user = os.getenv("PGUSER")
    db_password = os.getenv("PGPASSWORD")

    database.init(db_name, host=db_host, user=db_user, password=db_password, **kwargs)
    return database


class BaseModel(Model):
    """A base model that will use our Postgresql database"""

    class Meta:
        database = database


class Author(BaseModel):
    email = CharField(primary_key=True)
    name = CharField()


class Commit(BaseModel):
    hexsha = CharField(primary_key=True)
    committed_datetime = DateTimeTZField()
    authored_datetime = DateTimeTZField()
    message = TextField()
    author_email = ForeignKeyField(Author, backref="commits", field="email")
