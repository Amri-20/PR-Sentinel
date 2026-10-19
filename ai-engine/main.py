import json
import sys
from graph.workflow import review_graph

def run_code_review(filename,diff):
    initial_state={
        "filename":filename,
        "diff":diff,
        "review":None,
        "error":None,
        "status":"pending"
    }

    result=review_graph.invoke(initial_state)

    return {
        "status":result.get("status"),
        "review":result.get("review"),
        "error":result.get("error")
    }

if __name__=="__main__":
    try:
        input_data=json.loads(sys.stdin.read())
        filename=input_data.get("filename")
        diff=input_data.get("diff")

        result=run_code_review(filename,diff)

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({
            "status":"failed",
            "review":None,
            "error":str(e)
        }))

        sys.exit(1)