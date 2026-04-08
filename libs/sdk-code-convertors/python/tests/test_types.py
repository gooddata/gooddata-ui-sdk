# (C) 2026 GoodData Corporation

"""Smoke tests for generated TypedDict types."""

from __future__ import annotations

from gooddata_code_convertors._types import (
    AttributeHierarchy,
    Config,
    Dashboard,
    Dataset,
    DateDataset,
    Metric,
    Plugin,
    QueryAttributeFilter,
    QueryDateFilter,
    QueryFilter,
    QueryRankingFilter,
)


def test_metric_is_typeddict():
    m: Metric = {"id": "revenue", "type": "metric", "maql": "SELECT 1"}
    assert m["id"] == "revenue"
    assert m["type"] == "metric"


def test_dashboard_is_typeddict():
    d: Dashboard = {"id": "my_dash", "type": "dashboard"}
    assert d["type"] == "dashboard"


def test_query_attribute_filter():
    f: QueryAttributeFilter = {"type": "attribute_filter", "using": "attr.region"}
    assert f["using"] == "attr.region"


def test_key_types_importable():
    """All major domain types should be importable."""
    assert Metric is not None
    assert Dashboard is not None
    assert Dataset is not None
    assert DateDataset is not None
    assert Plugin is not None
    assert AttributeHierarchy is not None
    assert Config is not None
    assert QueryFilter is not None
    assert QueryDateFilter is not None
    assert QueryRankingFilter is not None
