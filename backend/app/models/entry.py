from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

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

class Title(Base):
    __tablename__ = "h_title"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("h_user.id"))
    title_name = Column(String(20))
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    user = relationship("User", back_populates="titles")
