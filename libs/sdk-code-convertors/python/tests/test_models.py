# (C) 2026 GoodData Corporation

"""Smoke tests for generated Pydantic models."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from gooddata_code_convertors.pydantic_models import (
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


def test_metric_validates():
    m = Metric.model_validate({"id": "revenue", "type": "metric", "maql": "SELECT 1"})
    assert m.id.root == "revenue"
    assert m.type.value == "metric"


def test_metric_rejects_missing_required_field():
    with pytest.raises(ValidationError):
        Metric.model_validate({"id": "revenue", "type": "metric"})  # missing maql


def test_dashboard_validates():
    d = Dashboard.model_validate({"id": "my_dash", "type": "dashboard"})
    assert d.id.root == "my_dash"


def test_query_attribute_filter_validates():
    f = QueryAttributeFilter.model_validate({"type": "attribute_filter", "using": "label/region"})
    assert f.using.root == "label/region"


def test_query_attribute_filter_rejects_bad_identifier_pattern():
    with pytest.raises(ValidationError):
        QueryAttributeFilter.model_validate({"type": "attribute_filter", "using": "not a valid id"})


def test_key_types_importable():
    """All major domain types should be importable, mirroring test_types.py coverage."""
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
