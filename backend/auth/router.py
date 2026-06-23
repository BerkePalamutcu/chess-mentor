from fastapi import APIRouter, Depends
from sqlmodel import Session

from auth.dependencies import get_current_user
from auth.schemas import (
    AuthResponse,
    ChangeEmailRequest,
    ChangePasswordRequest,
    DeleteAccountRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    UserOut,
)
from auth.service import (
    change_email,
    change_password,
    delete_account,
    login_user,
    logout_user,
    register_user,
    rotate_refresh_token,
)
from db.database import get_session
from db.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(data: RegisterRequest, session: Session = Depends(get_session)):
    return register_user(session, data)


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, session: Session = Depends(get_session)):
    return login_user(session, data)


@router.post("/refresh", response_model=AuthResponse)
def refresh(data: RefreshRequest, session: Session = Depends(get_session)):
    return rotate_refresh_token(session, data.refresh_token)


@router.post("/logout", status_code=204)
def logout(data: LogoutRequest, session: Session = Depends(get_session)):
    logout_user(session, data.refresh_token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/email", response_model=UserOut)
def update_email(
    data: ChangeEmailRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return change_email(session, current_user, data)


@router.patch("/password", status_code=204)
def update_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    change_password(session, current_user, data)


@router.delete("/account", status_code=204)
def remove_account(
    data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    delete_account(session, current_user, data)
