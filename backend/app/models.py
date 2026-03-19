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
