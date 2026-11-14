from agents.code_reviewer import review_code_diff

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

    if not review:
        return {
            "status":"Failed",
            "error":"Code review did not produce a valid result"
        }

    return {
        "status":"Completed"
    }