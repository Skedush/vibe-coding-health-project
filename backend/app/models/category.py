from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Category(Base):
    __tablename__ = "h_category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    link = Column(String(100))
    protocol = Column(String(100), default="https://")
    has_user_rule = Column(Boolean, default=True)
    child_link = Column(String(100))
    show_count = Column(Integer, default=0)
    created = Column(DateTime, default=datetime.utcnow)
    updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_delete = Column(Boolean, default=False)

    entries = relationship("Entry", back_populates="category")
    entry_infos = relationship("EntryInfo", back_populates="category")
