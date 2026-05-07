from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

# 中间表：用户选择条目关联
UserEntryOfEntry = Table(
    'h_userentry_entry',
    Base.metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('user_entry_id', Integer, ForeignKey("h_user_entry.id")),
    Column('entry_id', Integer, ForeignKey("h_entry.id")),
    Column('created', DateTime, default=datetime.utcnow),
)

class EntryInfo(Base):
    __tablename__ = "h_entry_info"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("h_user.id"))
    category_id = Column(Integer, ForeignKey("h_category.id"))
    title_id = Column(Integer, ForeignKey("h_title.id"))
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    user = relationship("User", back_populates="entry_infos")
    category = relationship("Category", back_populates="entry_infos")
    title = relationship("Title", back_populates="entry_infos")

class UserEntry(Base):
    __tablename__ = "h_user_entry"

    id = Column(Integer, primary_key=True, index=True)
    entry_info_id = Column(Integer, ForeignKey("h_entry_info.id"))
    name = Column(String(20))
    gender = Column(String(2), default="1")
    height = Column(String(10))
    weight = Column(String(10))
    age = Column(String(10))
    address = Column(String(255))
    waistline = Column(String(10))
    systolic_pressure = Column(String(20))
    diastolic_pressure = Column(String(20))
    blood_sugar = Column(String(20))
    remark = Column(Text)
    suggestion = Column(Text)
    phone = Column(String(11))
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    # M2M 到 Entry，通过 UserEntryOfEntry 中间表
    entries = relationship(
        "Entry",
        secondary=UserEntryOfEntry,
        backref="user_entries",
    )
