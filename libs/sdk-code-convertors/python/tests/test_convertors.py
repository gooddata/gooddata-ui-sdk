# (C) 2026 GoodData Corporation

"""Integration tests for gooddata-code-convertors Python wrapper.

Requires the WASM binary to be built first:
    cd sdk/libs/sdk-code-convertors && npm run build-wasm
"""

import pytest

from gooddata_code_convertors import (
    ConversionError,
    declarative_dashboard_to_yaml,
    declarative_parameter_to_yaml,
    yaml_metric_to_declarative,
    declarative_metric_to_yaml,
    yaml_parameter_to_declarative,
)


# Parsed YAML dict (as if from yaml.safe_load of an AAC metric file)
SAMPLE_METRIC = {
    "id": "revenue",
    "title": "Revenue",
    "format": "#,##0",
    "maql": "SELECT {metric/order_amount}",
}


def test_yaml_metric_to_declarative():
    result = yaml_metric_to_declarative(SAMPLE_METRIC)
    assert isinstance(result, dict)
    assert result["title"] == "Revenue"
    assert result["content"]["maql"] == "SELECT {metric/order_amount}"
    assert result["content"]["format"] == "#,##0"


def test_declarative_metric_to_yaml():
    declarative = yaml_metric_to_declarative(SAMPLE_METRIC)
    result = declarative_metric_to_yaml(declarative)
    assert isinstance(result, dict)


def test_graceful_on_empty_input():
    result = yaml_metric_to_declarative({})
    assert isinstance(result, dict)


def _ref(identifier, kind):
    return {"identifier": {"id": identifier, "type": kind}}


# A dashboard whose date filters use a period (a date range parameter), as the declarative API stores it.
PERIOD_DASHBOARD = {
    "id": "sales",
    "title": "Sales",
    "content": {
        "version": "2",
        "filterContextRef": _ref("sales_filters", "filterContext"),
        "dateFilterConfig": {"filterName": "Reporting period", "mode": "readonly"},
        "dateFilterConfigs": [
            {
                "dateDataSet": _ref("order_date", "dataset"),
                "config": {"filterName": "Order period", "mode": "active"},
            }
        ],
        "layout": {"type": "IDashboardLayout", "sections": []},
    },
}

PERIOD_FILTER_CONTEXT = {
    "id": "sales_filters",
    "title": "filterContext",
    "content": {
        "version": "2",
        "filters": [
            {
                "dashboardParameterizedDateFilter": {
                    "localIdentifier": "common_period",
                    "parameter": _ref("last_13_months", "parameter"),
                }
            },
            {
                "dashboardParameterizedDateFilter": {
                    "localIdentifier": "order_period",
                    "dataSet": _ref("order_date", "dataset"),
                    "parameter": _ref("last_13_months", "parameter"),
                    "emptyValueHandling": "exclude",
                }
            },
        ],
    },
}


def test_declarative_dashboard_to_yaml_with_periods():
    result = declarative_dashboard_to_yaml([], PERIOD_DASHBOARD, [PERIOD_FILTER_CONTEXT])
    assert result["json"]["filters"] == {
        "common_period": {
            "type": "date_filter",
            "parameter": "last_13_months",
            "title": "Reporting period",
            "mode": "readonly",
        },
        "order_period": {
            "type": "date_filter",
            "date": "order_date",
            "parameter": "last_13_months",
            "empty_values": "exclude",
            "title": "Order period",
        },
    }
    assert "parameter: last_13_months" in result["content"]


PERIOD = {
    "id": "last_13_months",
    "type": "parameter",
    "title": "Last 13 months",
    "definition": {
        "type": "DATE_RANGE",
        "defaultValue": {"granularity": "MONTH", "from": "2024-11", "to": "2025-11"},
    },
}


def test_parameter_round_trips():
    declarative = yaml_parameter_to_declarative(PERIOD)
    assert declarative["content"] == {
        "type": "DATE_RANGE",
        "defaultValue": {"granularity": "MONTH", "from": "2024-11", "to": "2025-11"},
    }
    assert declarative_parameter_to_yaml(declarative)["json"]["definition"] == PERIOD["definition"]


def test_conversion_error_on_unknown_function():
    from gooddata_code_convertors._wasm_runtime import call

    with pytest.raises(ConversionError, match="Unknown function"):
        call("nonExistentFunction")
