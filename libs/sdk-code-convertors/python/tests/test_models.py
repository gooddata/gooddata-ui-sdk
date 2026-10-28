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
    PublisherColorValueV2,
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


PALETTE_FAMILIES = ["primary", "success", "error", "warning", "info"]


@pytest.mark.parametrize(
    "color",
    [f"{{theme.palette.{family}}}" for family in PALETTE_FAMILIES]
    + [f"{{theme.palette.complementary.c{step}}}" for step in range(10)],
)
def test_publisher_color_accepts_each_palette_color(color):
    assert PublisherColorValueV2.model_validate(color).root == color


@pytest.mark.parametrize(
    "color",
    [
        f"{{theme.palette.{family}.{shade}}}"
        for family in PALETTE_FAMILIES
        for shade in ["light", "dark", "contrast", "base"]
    ]
    + [
        "{theme.palette.primary.lighter}",
        "{theme.palette.complementary.c10}",
        "{theme.palette.complementary}",
    ],
)
def test_publisher_color_rejects_a_palette_color_that_does_not_exist(color):
    with pytest.raises(ValidationError):
        PublisherColorValueV2.model_validate(color)
