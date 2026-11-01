from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from .models import Counter


def counter(db, key):
    db.execute(insert(Counter).values(key=key, value=0).on_conflict_do_nothing())
    return db.scalar(select(Counter).where(Counter.key == key).with_for_update())


def limit(db, key, maximum, increment=1):
    c = counter(db, key)
    if c.value + increment > maximum:
        return False
    c.value += increment
    return True
