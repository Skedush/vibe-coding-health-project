from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

# 中间表：条目自关联
Entryship = Table(
    'h_entry_ship',
    Base.metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('from_entry_id', Integer, ForeignKey("h_entry.id")),
    Column('to_entry_id', Integer, ForeignKey("h_entry.id")),
    Column('category_id', Integer, ForeignKey("h_category.id")),
    Column('created', DateTime, default=datetime.utcnow),
)

class Entry(Base):
    __tablename__ = "h_entry"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("h_category.id"))
    title = Column(String(255))
    remark = Column(String(255))
    sort = Column(Integer, default=999)
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    category = relationship("Category", back_populates="entries")
    # 自关联：通过 Entryship 中间表关联到其他 Entry
    entrys = relationship(
        "Entry",
        secondary=Entryship,
        primaryjoin="Entry.id==Entryship.c.from_entry_id",
        secondaryjoin="Entry.id==Entryship.c.to_entry_id",
        backref="from_entries",
    )

class Title(Base):
    __tablename__ = "h_title"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("h_user.id"))
    title_name = Column(String(20))
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    user = relationship("User", back_populates="titles")
