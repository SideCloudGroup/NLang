from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..auth import require_api_key
from ..deps import get_entry_store
from ..models import (
    CreateEntryRequest,
    DeleteEntryRequest,
    DeleteEntryResponse,
    EntryResponse,
    ErrorResponse,
    UpdateEntryByAbbrValueRequest,
    UpdateEntryByAbbrValueResponse,
)
from ..storage import EntryStore

router = APIRouter(prefix="/api/entries", tags=["entries"])


@router.get(
    "",
    response_model=list[EntryResponse],
    summary="按缩写查询词条（免鉴权）",
    operation_id="list_entries",
)
async def list_entries(
        abbr: str = Query(..., min_length=1, max_length=128, description="缩写（精确匹配）"),
        limit: int = Query(50, ge=1, le=200, description="分页大小"),
        offset: int = Query(0, ge=0, description="分页偏移"),
        store: EntryStore = Depends(get_entry_store),
) -> list[EntryResponse]:
    """按 `abbr` 精确匹配查询词条，支持分页。"""
    entries = await store.list_by_abbr(abbr, limit=limit, offset=offset)
    return [EntryResponse(**e.__dict__) for e in entries]


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=EntryResponse,
    responses={401: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
    summary="新增词条",
    dependencies=[Depends(require_api_key)],
    operation_id="create_entry",
)
async def create_entry(
        payload: CreateEntryRequest,
        store: EntryStore = Depends(get_entry_store),
) -> EntryResponse:
    """新增一条词条。缩写 `abbr` 允许重复。"""
    if await store.exists_abbr_value(payload.abbr, payload.value):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Entry already exists for this abbr+value",
        )
    entry = await store.create(payload.abbr, payload.value)
    return EntryResponse(**entry.__dict__)


@router.patch(
    "",
    response_model=UpdateEntryByAbbrValueResponse,
    responses={401: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
    summary="按缩写+释义更新词条",
    dependencies=[Depends(require_api_key)],
    operation_id="update_entries_by_abbr_value",
)
async def update_entry(
        payload: UpdateEntryByAbbrValueRequest,
        store: EntryStore = Depends(get_entry_store),
) -> UpdateEntryByAbbrValueResponse:
    """按 `abbr` + `value` 精确匹配更新，返回更新条数。"""
    if payload.new_abbr is None and payload.new_value is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one field (new_abbr/new_value) must be provided",
        )
    target_abbr = payload.new_abbr if payload.new_abbr is not None else payload.abbr
    target_value = payload.new_value if payload.new_value is not None else payload.value
    if (target_abbr != payload.abbr or target_value != payload.value) and await store.exists_abbr_value(
        target_abbr, target_value
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Target abbr+value already exists",
        )

    updated = await store.update_by_abbr_value(
        payload.abbr,
        payload.value,
        new_abbr=payload.new_abbr,
        new_value=payload.new_value,
    )
    return UpdateEntryByAbbrValueResponse(updated=updated)


@router.delete(
    "",
    response_model=DeleteEntryResponse,
    responses={401: {"model": ErrorResponse}},
    summary="按缩写+释义删除词条",
    dependencies=[Depends(require_api_key)],
    operation_id="delete_entries_by_abbr_value",
)
async def delete_entry(
        payload: DeleteEntryRequest,
        store: EntryStore = Depends(get_entry_store),
) -> DeleteEntryResponse:
    """按 `abbr` + `value` 精确匹配删除，返回删除条数。"""
    deleted = await store.delete_by_abbr_value(payload.abbr, payload.value)
    return DeleteEntryResponse(deleted=deleted)
