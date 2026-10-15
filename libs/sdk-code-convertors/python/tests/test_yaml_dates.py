# (C) 2026 GoodData Corporation

"""Values a YAML 1.1 reader such as PyYAML makes of unquoted dates.

Requires the WASM binary to be built first:
    cd sdk/libs/sdk-code-convertors && npm run build-wasm
"""

from datetime import date, datetime

import pytest

from gooddata_code_convertors import (
    ConversionError,
    yaml_publisher_document_to_declarative,
    yaml_publisher_document_to_declarative_v2,
)


def report(start, end) -> dict:
    return {
        "id": "q1",
        "type": "report",
        "title": "Q1",
        "period": {"start": start, "end": end},
        "pages": [],
    }


def document(start, end) -> dict:
    return {
        "id": "monthly",
        "type": "document",
        "version": "2",
        "title": "Monthly",
        "period": {"from": start, "to": end},
        "content": {"pages": []},
    }


def test_v1_document_with_date_values_converts_as_with_strings():
    assert yaml_publisher_document_to_declarative(
        report(date(2026, 1, 1), date(2026, 3, 31))
    ) == yaml_publisher_document_to_declarative(report("2026-01-01", "2026-03-31"))


def test_v2_document_with_date_values_converts_as_with_strings():
    assert yaml_publisher_document_to_declarative_v2(
        document(date(2026, 1, 1), date(2026, 6, 30))
    ) == yaml_publisher_document_to_declarative_v2(document("2026-01-01", "2026-06-30"))


def test_a_datetime_value_raises_a_conversion_error():
    with pytest.raises(ConversionError, match="datetime"):
        yaml_publisher_document_to_declarative_v2(
            document(datetime(2026, 1, 1, 10, 30), "2026-06-30")
        )


def test_a_date_used_as_a_key_raises_a_conversion_error():
    written = document("2026-01-01", "2026-06-30")
    written["content"]["filters"] = {date(2026, 1, 1): {"type": "date_filter"}}

    with pytest.raises(ConversionError, match="key"):
        yaml_publisher_document_to_declarative_v2(written)
