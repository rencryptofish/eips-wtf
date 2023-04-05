import logging
import os
from playhouse.pool import PooledPostgresqlExtDatabase
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

class Commit(BaseModel):
    pass

