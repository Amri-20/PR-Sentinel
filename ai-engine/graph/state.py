from typing import Optional, TypedDict

class ReviewState(TypedDict):
    filename:str
    diff:str

    review:Optional[dict]
    error:Optional[str]

    status:str
