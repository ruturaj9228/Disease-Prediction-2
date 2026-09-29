import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from .database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, index=True) # UUID
    session_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String, default="collecting") # collecting, ready, emergency, completed
    duration = Column(String, nullable=True)
    severity = Column(String, nullable=True)
    safety_flag = Column(Boolean, default=False)

    symptoms = relationship("AssessmentSymptom", back_populates="assessment", cascade="all, delete-orphan")
    messages = relationship("ConversationMessage", back_populates="assessment", cascade="all, delete-orphan")
    prediction = relationship("Prediction", back_populates="assessment", uselist=False, cascade="all, delete-orphan")


class AssessmentSymptom(Base):
    __tablename__ = "assessment_symptoms"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    name = Column(String, index=True)
    status = Column(String) # PRESENT, ABSENT, UNKNOWN
    source = Column(String, default="nlp") # nlp, manual

    assessment = relationship("Assessment", back_populates="symptoms")


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(String, primary_key=True, index=True)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    sender = Column(String) # user, assistant, system
    text = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="messages")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    predicted_condition = Column(String, index=True)
    model_score = Column(Float)
    top_predictions = Column(JSON) # e.g. [{"disease": "...", "model_score": ...}]
    symptoms_used = Column(JSON) # e.g. ["headache", "fever"]
    model_version = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    assessment = relationship("Assessment", back_populates="prediction")


class GuidanceContent(Base):
    __tablename__ = "guidance_content"

    id = Column(Integer, primary_key=True, index=True)
    condition_name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    supportive_care = Column(JSON, default=list)
    general_precautions = Column(JSON, default=list)
    things_to_avoid = Column(JSON, default=list)
    warning_signs = Column(JSON, default=list)
    when_to_seek_care = Column(JSON, default=list)
    source_name = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    last_reviewed = Column(String, nullable=True)
