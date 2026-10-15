# (C) 2026 GoodData Corporation

"""v2 Publisher entities through the WASM converters.

Requires the WASM binary to be built first:
    cd sdk/libs/sdk-code-convertors && npm run build-wasm
"""

import pytest

from gooddata_code_convertors import (
    ConversionError,
    declarative_publisher_document_template_to_yaml_v2,
    declarative_publisher_document_to_yaml_v2,
    declarative_publisher_page_template_to_yaml_v2,
    fill_publisher_ids_v2,
    validate_publisher_entity_v2,
    yaml_publisher_document_template_to_declarative_v2,
    yaml_publisher_document_to_declarative_v2,
    yaml_publisher_page_template_to_declarative_v2,
)
from gooddata_code_convertors.pydantic_models import (
    PublisherDocumentTemplateV2,
    PublisherDocumentV2,
    PublisherPageTemplateV2,
)

REGION_FILTER = {
    "attributeFilter": {
        "displayForm": {"identifier": "region.name", "type": "displayForm"},
        "negativeSelection": True,
        "attributeElements": {"uris": []},
        "localIdentifier": "document_filter_region_name",
        "title": "Region",
        "selectionMode": "multi",
    }
}

DOCUMENT = {
    "id": "northwind-h1-2026",
    "type": "document",
    "version": "2",
    "title": "Northwind, H1 2026",
    "tags": ["revenue"],
    "period": {"type": "relative", "granularity": "GDC.time.month", "from": -6, "to": -1},
    "content": {
        "defaults": {"takeaway": {"generation": {"instructions": "Write for executives."}}},
        "filters": [
            REGION_FILTER,
            {
                "dateFilter": {
                    "type": "absolute",
                    "granularity": "GDC.time.date",
                    "from": "2026-01-01",
                    "to": "2026-03-31",
                    "dataSet": {"identifier": "ship_date", "type": "dataSet"},
                    "localIdentifier": "document_filter_ship_date",
                }
            },
        ],
        "sections": [
            {
                "id": "revenue",
                "title": "Revenue",
                "pages": [
                    {
                        "id": "content",
                        "layout": {
                            "type": "row",
                            "children": [
                                {
                                    "type": "visualization",
                                    "id": "widget1",
                                    "visualization": {"identifier": "revenue_by_month", "type": "insight"},
                                    "dateDataSet": {"identifier": "order_date", "type": "dataSet"},
                                    "ignoreDocumentFilters": [
                                        {
                                            "type": "attributeFilterReference",
                                            "displayForm": {"identifier": "region.name", "type": "displayForm"},
                                        }
                                    ],
                                },
                                {"type": "text", "id": "summary", "markdown": "no"},
                            ],
                        },
                    },
                    {"id": "appendix", "visible": False, "layout": {"type": "column", "children": []}},
                ],
            }
        ],
    },
}

DOCUMENT_TEMPLATE = {
    "id": "quarterly_review",
    "type": "documentTemplate",
    "version": "2",
    "title": "Quarterly review",
    "content": {
        "defaults": {"period": {"type": "relative", "granularity": "GDC.time.quarter", "from": -1, "to": -1}},
        "pages": [{"id": "cover", "layout": {"type": "title", "id": "title", "markdown": "{documentName}"}}],
    },
}

PAGE_TEMPLATE = {
    "id": "two_charts",
    "type": "pageTemplate",
    "version": "2",
    "title": "Two charts",
    "content": {
        "kind": "content",
        "pageSize": "widescreen",
        "layout": {
            "type": "row",
            "children": [
                {"type": "visualization", "id": "left", "placeholder": {"hint": "Pick a chart", "required": True}},
                {"type": "visualization", "id": "right", "display": {"dataLabels": {"visible": "auto"}}},
            ],
        },
    },
}

CASES = [
    (
        DOCUMENT,
        declarative_publisher_document_to_yaml_v2,
        yaml_publisher_document_to_declarative_v2,
        PublisherDocumentV2,
    ),
    (
        DOCUMENT_TEMPLATE,
        declarative_publisher_document_template_to_yaml_v2,
        yaml_publisher_document_template_to_declarative_v2,
        PublisherDocumentTemplateV2,
    ),
    (
        PAGE_TEMPLATE,
        declarative_publisher_page_template_to_yaml_v2,
        yaml_publisher_page_template_to_declarative_v2,
        PublisherPageTemplateV2,
    ),
]


@pytest.mark.parametrize(("stored", "to_yaml", "to_declarative", "_model"), CASES)
def test_round_trips_through_yaml(stored, to_yaml, to_declarative, _model):
    assert to_declarative(to_yaml(stored)["json"]) == stored


@pytest.mark.parametrize(("stored", "to_yaml", "_to_declarative", "model"), CASES)
def test_written_yaml_matches_the_schema_models(stored, to_yaml, _to_declarative, model):
    model.model_validate(to_yaml(stored)["json"])


def test_written_yaml_states_its_version_and_quotes_what_yaml_1_1_would_retype():
    content = declarative_publisher_document_to_yaml_v2(DOCUMENT)["content"]

    assert 'version: "2"' in content
    assert 'from: "2026-01-01"' in content
    assert 'markdown: "no"' in content


@pytest.mark.parametrize("stored", [DOCUMENT, DOCUMENT_TEMPLATE, PAGE_TEMPLATE])
def test_validator_accepts_a_valid_entity(stored):
    assert validate_publisher_entity_v2(stored) == []


def test_validator_reports_content_issues_with_their_paths():
    invalid = {**PAGE_TEMPLATE, "content": {"layout": {"type": "spacer"}}}

    assert [issue["path"] for issue in validate_publisher_entity_v2(invalid)] == ["content.layout.type"]


def test_validator_reports_an_issue_on_the_reference_on_the_id():
    reserved = {**PAGE_TEMPLATE, "id": "default.cover"}

    assert [issue["path"] for issue in validate_publisher_entity_v2(reserved)] == ["id"]


def test_rejects_a_yaml_version_it_does_not_know():
    written = {**declarative_publisher_page_template_to_yaml_v2(PAGE_TEMPLATE)["json"], "version": "3"}

    with pytest.raises(ConversionError, match='Content version "3" is not supported'):
        yaml_publisher_page_template_to_declarative_v2(written)


def test_fills_missing_ids_and_keeps_comments():
    content = """# hand-written
type: page_template
id: two
version: "2"
title: Two
content:
    layout:
        type: row
        children:
            - type: text # no id yet
"""
    filled = fill_publisher_ids_v2(content)

    assert filled["changed"] is True
    assert "# no id yet" in filled["content"]
    assert "id: widget_" in filled["content"]
    assert fill_publisher_ids_v2(filled["content"]) == {"content": filled["content"], "changed": False}
