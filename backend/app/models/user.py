from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "h_user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, index=True, nullable=False)
    email = Column(String(254), unique=True, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(11))
    gender = Column(String(2), default="1")
    is_active = Column(Boolean, default=False)
    is_title = Column(Boolean, default=False)
    is_vip = Column(Boolean, default=False)
    is_delete = Column(Boolean, default=False)
    date_joined = Column(DateTime, default=datetime.utcnow)
    date_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    titles = relationship("Title", back_populates="user")
    entry_infos = relationship("EntryInfo", back_populates="user")
