import re
from typing import Dict, Any, List


class RequestClassifier:
    """Classifies user input into intent categories and evaluates context requirements."""

    CATEGORIES = {
        "coding": ["code", "python", "javascript", "typescript", "react", "bug", "function", "api", "sql", "html", "css", "class", "error", "refactor"],
        "document_qa": ["pdf", "document", "file", "report", "csv", "summary of document", "uploaded file"],
        "data_analysis": ["data", "csv", "table", "graph", "trend", "statistics", "metrics", "chart", "analyze data"],
        "writing": ["write", "essay", "article", "email", "blog", "draft", "story", "copywriting", "poem"],
        "summarization": ["summarize", "tl;dr", "key points", "overview", "bullet points", "synopsis"],
        "research": ["compare", "market", "history", "study", "explain how", "deep dive", "architecture", "pros and cons"],
        "reasoning": ["puzzle", "math", "logic", "proof", "riddle", "calculate", "solve", "step by step"]
    }

    @classmethod
    def classify(cls, prompt: str, document_attached: bool = False) -> Dict[str, Any]:
        p_lower = prompt.lower()

        if document_attached:
            category = "document_qa"
        else:
            scores = {}
            for cat, keywords in cls.CATEGORIES.items():
                match_count = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', p_lower))
                if match_count > 0:
                    scores[cat] = match_count

            if scores:
                category = max(scores, key=scores.get)
            else:
                category = "general"

        requires_rag = document_attached or any(k in p_lower for k in ["according to document", "in the file", "uploaded", "pdf", "report"])
        recommend_compare = category in ["coding", "research", "reasoning", "data_analysis"] or "compare" in p_lower or "versus" in p_lower

        return {
            "category": category,
            "requires_rag": requires_rag,
            "recommend_compare": recommend_compare,
            "confidence": 0.95 if document_attached else 0.85
        }
