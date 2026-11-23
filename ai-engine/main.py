import json
import sys
import os
from dotenv import load_dotenv
load_dotenv()


def run_code_review(filename, diff):

    # Temporary mock mode for integration testing
    if os.getenv("PR_SENTINEL_MOCK_AI") == "true":
        return {
            "status": "completed",
            "review": {
                "summary": "Mock code review completed successfully.",
                "findings": [
                    {
                        "severity": "high",
                        "category": "security",
                        "file": filename,
                        "line": None,
                        "title": "SQL Injection vulnerability",
                        "description": "User input is directly concatenated into an SQL query.",
                        "suggested_fix": "Use parameterized SQL queries."
                    }
                ]
            },
            "error": None
        }
    from graph.workflow import review_graph

    initial_state = {
        "filename": filename,
        "diff": diff,
        "review": None,
        "error": None,
        "status": "pending"
    }

    result = review_graph.invoke(initial_state)

    return {
        "status": result.get("status"),
        "review": result.get("review"),
        "error": result.get("error")
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