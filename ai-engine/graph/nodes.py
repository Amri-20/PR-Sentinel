from agents.code_reviewer import CodeReview, review_code_diff
from pydantic import ValidationError

def validate_input(state):
    filename=state.get("filename")
    diff=state.get("diff")

    if not filename or not diff:
       return {
           "status":"failed",
           "error":"Filename and code difference is required"
       }

    return {
        "status":"valid",
        "error":None
    }

def review_code(state):
    try:
        result=review_code_diff(
            state["filename"],
            state["diff"]
        )

        return {
            "review":result,
            "status":"completed",
            "error":None
        }
    except Exception as e:
        return{
            "review":None,
            "status":"failed",
            "error":str(e)
        }

def validate_review(state):
    review=state.get("review")

    if not isinstance(review,dict):
        return {
            "status":"Failed",
            "error":"Review output must be a dictionary"
        }

    try:
        validated_review = CodeReview.model_validate(review)

        return {
            "review":validated_review.model_dump(),
            "status":"completed",
            "error":None
        }

    except ValidationError as e:
        return{
            "status":"failed",
            "error":f"Invalid review output: {e}"
        }

    # return {
    #     "status":"Completed"
    # }
