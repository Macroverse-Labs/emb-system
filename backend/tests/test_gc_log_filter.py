"""The access log's filter predicates, which the log screen and its export share."""

from app.models.gc.records import AccessEvent
from app.routers.gc.resources import filter_log


def _event(person: str, company: str, verdict: str, direction: str, note: str = "") -> AccessEvent:
    return AccessEvent(
        occurred_label="06:31",
        person=person,
        company=company,
        device_label="Gate A · T-01",
        direction=direction,
        verdict=verdict,
        note=note,
    )


EVENTS = [
    _event("Aziz Rahman", "Pantas Steelworks", "pass", "in"),
    _event("Lim Wei", "Sinar Electrical", "deny", "in", "Card expired"),
    _event("Chen Hua", "Visitor · Client", "pass", "out"),
]


def test_filters_match_the_console() -> None:
    """`all`, `deny`, `visitor` and `out` select what `vm3.ts` selects."""
    assert len(filter_log(EVENTS, "", "all")) == 3
    assert [e.person for e in filter_log(EVENTS, "", "deny")] == ["Lim Wei"]
    assert [e.person for e in filter_log(EVENTS, "", "visitor")] == ["Chen Hua"]
    assert [e.person for e in filter_log(EVENTS, "", "out")] == ["Chen Hua"]


def test_search_spans_person_company_device_and_note() -> None:
    """The search box matches the same four columns the design concatenates."""
    assert [e.person for e in filter_log(EVENTS, "pantas", "all")] == ["Aziz Rahman"]
    assert [e.person for e in filter_log(EVENTS, "card expired", "all")] == ["Lim Wei"]
    assert len(filter_log(EVENTS, "gate a", "all")) == 3
    assert filter_log(EVENTS, "nobody", "all") == []
