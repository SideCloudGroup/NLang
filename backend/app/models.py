from __future__ import annotations

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    detail: str = Field(..., examples=["Invalid API key"])


class EntryResponse(BaseModel):
    id: int
    abbr: str
    value: str
    created_at: int
    updated_at: int


class CreateEntryRequest(BaseModel):
    abbr: str = Field(..., min_length=1, max_length=128, description="缩写（可重复）")
    value: str = Field(..., min_length=1, max_length=2048, description="对应词/短语")


class UpdateEntryByAbbrValueRequest(BaseModel):
    abbr: str = Field(..., min_length=1, max_length=128, description="要匹配的缩写（旧值）")
    value: str = Field(..., min_length=1, max_length=2048, description="要匹配的释义（旧值）")
    new_abbr: str | None = Field(None, min_length=1, max_length=128, description="新的缩写（可选）")
    new_value: str | None = Field(None, min_length=1, max_length=2048, description="新的释义（可选）")


class UpdateEntryByAbbrValueResponse(BaseModel):
    updated: int = Field(..., ge=0, description="更新条数（按 abbr+value 精确匹配）")


class DeleteEntryRequest(BaseModel):
    abbr: str = Field(..., min_length=1, max_length=128)
    value: str = Field(..., min_length=1, max_length=2048)


class DeleteEntryResponse(BaseModel):
    deleted: int = Field(..., ge=0, description="删除条数（按 abbr+value 精确匹配）")


class SegmentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4096, description="待切分字符串")


class SegmentPair(BaseModel):
    token: str = Field(..., description="命中的 token")
    values: list[str] = Field(..., description="token 对应的候选值列表")


class SegmentCandidate(BaseModel):
    pairs: list[SegmentPair] = Field(..., description="按切分顺序返回的 token-value 对")


class SegmentResponse(BaseModel):
    candidates: list[SegmentCandidate] = Field(default_factory=list, description="所有可行切分方案")
