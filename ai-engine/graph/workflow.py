
from langgraph.graph import StateGraph, START, END
from graph.state import ReviewState
from graph.nodes import validate_input, review_code, validate_review


def route_after_input(state):
    if state["status"] == "valid":
        return "Review"

    return END


def route_after_review(state):
    if state["status"] == "Completed":
        return "Validate review"

    return END


def build_review_graph():
    graph = StateGraph(ReviewState)

    graph.add_node("Validate Input", validate_input)
    graph.add_node("Review", review_code)
    graph.add_node("Validate review", validate_review)

    graph.add_edge(START, "Validate Input")

    graph.add_conditional_edges(
        "Validate Input",
        route_after_input,
        {
            "Review": "Review",
            END: END
        }
    )

    graph.add_conditional_edges(
        "Review",
        route_after_review,
        {
            "Validate review": "Validate review",
            END: END
        }
    )

    graph.add_edge("Validate review", END)

    return graph.compile()


review_graph = build_review_graph()
