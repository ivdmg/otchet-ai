from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.api import UserRegister, UserLogin, Token, UserRead

router = APIRouter()


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Регистрация нового пользователя",
)
async def register(
    user_in: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    """
    Регистрация нового пользователя в системе.
    Проверяет уникальность email и начисляет начальный баланс (10 кредитов).
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже зарегистрирован",
        )

    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        balance_credits=10,
        role=UserRole.USER,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Авторизация пользователя и получение JWT токена",
)
async def login(
    user_in: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Авторизация по email и паролю.
    Принимает JSON тело с email и password, возвращает JWT access_token.
    """
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь деактивирован",
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer")


@router.get(
    "/me",
    response_model=UserRead,
    summary="Получение профиля текущего авторизованного пользователя",
)
async def get_me(
    current_user: User = Depends(get_current_active_user),
):
    """Возвращает информацию о текущем авторизованном пользователе."""
    return current_user
