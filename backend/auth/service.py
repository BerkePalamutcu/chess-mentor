from datetime import timezone

from fastapi import HTTPException, status
from sqlmodel import Session, select

from auth.schemas import (
    AuthResponse,
    ChangeEmailRequest,
    ChangePasswordRequest,
    DeleteAccountRequest,
    LoginRequest,
    RegisterRequest,
)
from core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_token,
    refresh_token_expiry,
    verify_password,
)
from db.models import PuzzleAttempt, RefreshToken, User, UserPuzzleProfile


def _build_token_pair(session: Session, user_id: int) -> AuthResponse:
    raw, token_hash = create_refresh_token()
    db_token = RefreshToken(
        token_hash=token_hash,
        user_id=user_id,
        expires_at=refresh_token_expiry(),
    )
    session.add(db_token)
    session.commit()
    return AuthResponse(
        access_token=create_access_token(user_id),
        refresh_token=raw,
    )


def register_user(session: Session, data: RegisterRequest) -> AuthResponse:
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return _build_token_pair(session, user.id)


def login_user(session: Session, data: LoginRequest) -> AuthResponse:
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")
    return _build_token_pair(session, user.id)


def rotate_refresh_token(session: Session, raw_token: str) -> AuthResponse:
    from datetime import datetime

    token_hash = hash_token(raw_token)
    stored = session.exec(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    ).first()

    if not stored:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")

    now = datetime.now(timezone.utc)
    expires = stored.expires_at
    if expires.tzinfo is None:
        from datetime import timezone as tz
        expires = expires.replace(tzinfo=tz.utc)

    if now > expires:
        session.delete(stored)
        session.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token expired")

    user_id = stored.user_id
    # Delete old token (rotation)
    session.delete(stored)
    session.commit()

    return _build_token_pair(session, user_id)


def logout_user(session: Session, raw_token: str) -> None:
    token_hash = hash_token(raw_token)
    stored = session.exec(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    ).first()
    if stored:
        session.delete(stored)
        session.commit()


def change_email(session: Session, user: User, data: ChangeEmailRequest) -> User:
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect password")
    if data.email == user.email:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "That is already your email")
    taken = session.exec(select(User).where(User.email == data.email)).first()
    if taken:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user.email = data.email
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def change_password(session: Session, user: User, data: ChangePasswordRequest) -> None:
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Current password is incorrect")

    user.hashed_password = hash_password(data.new_password)
    session.add(user)
    # Revoke all existing sessions so other devices must re-authenticate.
    for token in session.exec(select(RefreshToken).where(RefreshToken.user_id == user.id)).all():
        session.delete(token)
    session.commit()


def delete_account(session: Session, user: User, data: DeleteAccountRequest) -> None:
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect password")

    # Remove all of the user's data, then the account itself.
    for attempt in session.exec(select(PuzzleAttempt).where(PuzzleAttempt.user_id == user.id)).all():
        session.delete(attempt)
    for profile in session.exec(select(UserPuzzleProfile).where(UserPuzzleProfile.user_id == user.id)).all():
        session.delete(profile)
    for token in session.exec(select(RefreshToken).where(RefreshToken.user_id == user.id)).all():
        session.delete(token)
    session.delete(user)
    session.commit()
