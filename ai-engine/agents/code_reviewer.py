import os
from typing import Literal
from pydantic import BaseModel,Field
from dotenv import  load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")



class ReviewFinding(BaseModel):
    severity: Literal[
        "critical", "high", "medium", "low", "info"
    ] = Field(description="Severity of the issue")

    category: Literal[
        "bug", "security", "performance", "quality"
    ] = Field(description="Category of the issue")

    file: str = Field(
        description="Name of the affected file"
    )

    line: int | None = Field(
        default=None,
        description="Changed line number, or null if unknown"
    )

    title: str = Field(
        description="Short issue title"
    )

    description: str = Field(
        description="Explanation of the issue"
    )

    suggested_fix: str = Field(
        description="Suggested solution for the issue"
    )


class CodeReview(BaseModel):
    summary: str = Field(
        description="Brief review summary"
    )

    findings: list[ReviewFinding] = Field(
        default_factory=list,
        description="List of genuine code review findings"
    )


MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

review_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are an experienced senior software engineer
        performing code reviews of GitHub Pull Requests.

        Analyse code changes carefully.

        Identify:
        1. Bugs and logical errors.
        2. Security vulnerabilities.
        3. Performance issues.
        4. Incorrect edge-case handling.
        5. Code quality problems.

        Important rules:
        - Only report genuine issues.
        - Do not invent problems.
        - Analyse only the supplied code diff.
        - Do not report unchanged code as a new issue.
        - Do not assume missing context is definitely a bug.
        - Use null when the exact changed line cannot be identified.
        - If no issues exist, return an empty findings list.
        - Keep suggested fixes practical and specific.
        """
    ),
    (
        "human",
        """Review the following code changes.

        FILE: {filename}

        CODE DIFF:
        {diff}

        Return the structured code review.
        """
    )
])


def review_code_diff(filename,diff):
    if not filename or not diff:
        raise ValueError("Filename and code difference are required")

    if not GOOGLE_API_KEY:
        raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY not found in the environment variables")

    llm = ChatGoogleGenerativeAI(
        model=MODEL_NAME,
        google_api_key=GOOGLE_API_KEY,
        temperature=0,
    )
    review_chain = review_prompt | llm.with_structured_output(CodeReview)

    response=review_chain.invoke({
        "filename":filename,
        "diff":diff
    })

    for finding in response.findings:
        finding.file=filename

    return response.model_dump()

