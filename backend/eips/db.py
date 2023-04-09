import logging
import os

from peewee import (SQL, BigIntegerField, BooleanField, CharField,
                    CompositeKey, DateField, DateTimeField, DecimalField,
                    DoubleField, FloatField, ForeignKeyField, IntegerField,
                    Model, PrimaryKeyField, TextField)
from playhouse.pool import PooledPostgresqlExtDatabase
from playhouse.postgres_ext import (ArrayField, BinaryJSONField,
                                    DateTimeTZField, JSONField)

logger = logging.getLogger(__name__)

database = PooledPostgresqlExtDatabase(None)


def get_db_conn(**kwargs):
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
    hexsha = CharField(max_length=40, primary_key=True)
    committed_datetime = DateTimeField(null=True)
    authored_datetime = DateTimeField(null=True)
    message = TextField(null=True)
    author_email = TextField(null=True)
    author_name = TextField(null=True)

    class Meta:
        table_name = "commits"


class EIP(BaseModel):
    eip = IntegerField(primary_key=True)
    title = CharField(max_length=255)
    author = TextField()
    status = CharField(max_length=255)
    type = CharField(max_length=255, column_name="type")
    category = CharField(max_length=255, null=True)
    created = DateField()
    requires = ArrayField(IntegerField, null=True)
    last_call_deadline = DateField(null=True)
    content = TextField(column_name="content")

    class Meta:
        table_name = "eips"


class EIPDiff(BaseModel):
    hexsha = CharField(max_length=40)
    eip = IntegerField()

    class Meta:
        table_name = "eip_diffs"
        primary_key = CompositeKey("hexsha", "eip")
