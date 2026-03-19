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
    SegmentCandidate,
    SegmentPair,
    SegmentRequest,
    SegmentResponse,
    UpdateEntryByAbbrValueRequest,
    UpdateEntryByAbbrValueResponse,
)
from ..storage import EntryStore

router = APIRouter(prefix="/api/entries", tags=["entries"])


@router.get(
    "",
    response_model=list[EntryResponse],
    summary="列出缩写词条",
    description="按缩写精确匹配列出词条，支持 limit 和 offset 分页参数。",
    operation_id="list_entries",
)
async def list_entries(
        abbr: str = Query(..., min_length=1, max_length=128, description="缩写（精确匹配）"),
        limit: int = Query(50, ge=1, le=200, description="分页大小"),
        offset: int = Query(0, ge=0, description="分页偏移"),
        store: EntryStore = Depends(get_entry_store),
) -> list[EntryResponse]:
    """列出指定缩写下的所有词条，支持分页。"""
    entries = await store.list_by_abbr(abbr, limit=limit, offset=offset)
    return [EntryResponse(**e.__dict__) for e in entries]


@router.post(
    "/segment",
    response_model=SegmentResponse,
    summary="搜索缩写的可行组合",
    description="基于已录入的缩写词典，对输入文本执行多路径切分，返回所有可行的缩写组合。",
    operation_id="search_abbr",
)
async def search_abbr(
        payload: SegmentRequest,
        store: EntryStore = Depends(get_entry_store),
) -> SegmentResponse:
    """基于缩写词典搜索输入文本的所有可行切分组合。"""
    text = payload.text
    token_set = set(await store.list_distinct_abbrs())
    if not token_set:
        return SegmentResponse(candidates=[])

    abbr_to_values = await store.map_values_by_abbrs(list(token_set))

    token_lengths = sorted({len(t) for t in token_set if t}, reverse=True)
    n = len(text)
    dp: list[list[list[str]]] = [[] for _ in range(n + 1)]
    dp[n] = [[]]

    for i in range(n - 1, -1, -1):
        paths: list[list[str]] = []
        for length in token_lengths:
            end = i + length
            if end > n:
                continue
            piece = text[i:end]
            if piece not in token_set:
                continue
            for suffix in dp[end]:
                paths.append([piece, *suffix])
        dp[i] = paths

    candidates = []
    for parts in dp[0]:
        pairs = [SegmentPair(token=token, values=abbr_to_values.get(token, [token])) for token in parts]
        candidates.append(SegmentCandidate(pairs=pairs))
    return SegmentResponse(candidates=candidates)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=EntryResponse,
    responses={401: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
    summary="创建一条缩写",
    description="创建一条缩写词条；同一缩写可对应多个不同 value，但重复的缩写+value 会被拒绝。",
    dependencies=[Depends(require_api_key)],
    operation_id="create_entry",
)
async def create_entry(
        payload: CreateEntryRequest,
        store: EntryStore = Depends(get_entry_store),
) -> EntryResponse:
    """创建一条缩写词条；同一缩写可对应多条 value。"""
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
    summary="更新一条缩写",
    description="按缩写+value 精确匹配更新词条，可修改缩写、value 或两者，返回更新条数。",
    dependencies=[Depends(require_api_key)],
    operation_id="update_entries_by_abbr_value",
)
async def update_entries_by_abbr_value(
        payload: UpdateEntryByAbbrValueRequest,
        store: EntryStore = Depends(get_entry_store),
) -> UpdateEntryByAbbrValueResponse:
    """按缩写+value 精确匹配更新一条词条。"""
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
    summary="删除一条缩写",
    description="按缩写+value 精确匹配删除一条词条，返回删除条数。",
    dependencies=[Depends(require_api_key)],
    operation_id="delete_entries_by_abbr_value",
)
async def delete_entries_by_abbr_value(
        payload: DeleteEntryRequest,
        store: EntryStore = Depends(get_entry_store),
) -> DeleteEntryResponse:
    """按缩写+value 精确匹配删除一条词条。"""
    deleted = await store.delete_by_abbr_value(payload.abbr, payload.value)
    return DeleteEntryResponse(deleted=deleted)
