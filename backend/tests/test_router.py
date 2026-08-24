from app.agents.classifier import RequestClassifier
from app.agents.router import AgentRouter


def test_request_classifier():
    res1 = RequestClassifier.classify("Write a python script to parse JSON")
    assert res1["category"] == "coding"

    res2 = RequestClassifier.classify("Summarize the uploaded file", document_attached=True)
    assert res2["category"] == "document_qa"
    assert res2["requires_rag"] is True


def test_agent_router_modes():
    # Test AUTO mode
    providers_auto, reason_auto = AgentRouter.route("auto", "coding")
    assert len(providers_auto) == 1
    assert "coding" in reason_auto

    # Test SINGLE mode
    providers_single, reason_single = AgentRouter.route("single", "general", requested_model="claude")
    assert len(providers_single) == 1

    # Test COMPARE mode
    providers_compare, reason_compare = AgentRouter.route("compare", "general")
    assert len(providers_compare) >= 2
    assert "compare" in reason_compare.lower()
