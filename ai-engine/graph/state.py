from typing import TypedDict,Optional

class ReviewState(TypedDict):
    filename:str
    diff:str

    review:Optional[dict]
    error:Optional[dict]

    status:str