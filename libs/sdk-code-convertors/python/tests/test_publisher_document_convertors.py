# (C) 2026 GoodData Corporation

"""Publisher document round trip through the WASM converters.

Requires the WASM binary to be built first:
    cd sdk/libs/sdk-code-convertors && npm run build-wasm
"""

from gooddata_code_convertors import (
    declarative_publisher_document_to_yaml,
    declarative_report_to_yaml,
    yaml_publisher_document_to_declarative,
    yaml_report_document_to_declarative,
)

DOCUMENT = {
    "id": "q1",
    "title": "Q1",
    "description": "",
    "tags": [],
    "periodStart": "2026-01-01",
    "periodEnd": "2026-03-31",
    "variableValues": {"brand": "Levi's"},
    "content": {
        "version": "1",
        "pages": [
            {
                "localIdentifier": "p1",
                "layout": {
                    "type": "section",
                    "direction": "row",
                    "children": [{"type": "slotRef", "slotId": "h"}],
                },
                "slots": [
                    {"type": "heading", "localIdentifier": "h", "source": {"type": "static", "content": "Hi"}}
                ],
                "filters": [
                    {
                        "attributeFilter": {
                            "displayForm": {"identifier": "label.region", "type": "displayForm"},
                            "negativeSelection": False,
                            "attributeElements": {"uris": ["East", "West"]},
                            "localIdentifier": "region",
                            "title": "Region",
                            "selectionMode": "multi",
                        }
                    }
                ],
            }
        ],
        "variables": [{"name": "brand", "title": "Brand", "defaultValue": "Levi's"}],
        "filters": [
            {
                "dateFilter": {
                    "localIdentifier": "date",
                    "type": "relative",
                    "granularity": "GDC.time.month",
                    "from": -5,
                    "to": 0,
                    "dataSet": {"identifier": "date", "type": "dataSet"},
                }
            }
        ],
    },
}


def test_declarative_publisher_document_to_yaml():
    result = declarative_publisher_document_to_yaml(DOCUMENT)
    document = result["json"]
    assert document["type"] == "report"
    assert document["period"] == {"start": "2026-01-01", "end": "2026-03-31"}
    assert document["pages"][0]["filters"]["region"]["using"] == "label/label.region"
    assert "content" in result


def test_publisher_document_round_trip():
    document = declarative_publisher_document_to_yaml(DOCUMENT)["json"]
    assert yaml_publisher_document_to_declarative(document) == DOCUMENT


def test_former_names_are_the_same_converters():
    assert yaml_report_document_to_declarative is yaml_publisher_document_to_declarative
    assert declarative_report_to_yaml is declarative_publisher_document_to_yaml
