from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

class UserCredentials(BaseModel):
    username: str
    password: str

@router.post("/register", status_code=201)
def register(credentials: UserCredentials, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        username=credentials.username,
        password=hash_password(credentials.password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@router.post("/login")
def login(credentials: UserCredentials, db: Session = Depends(get_db)):
    # Hardcoded example user bypass for development
    if credentials.username == "admin" and credentials.password == "password":
        token = create_access_token({"sub": "admin"})
        return {"access_token": token, "token_type": "bearer"}

    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}