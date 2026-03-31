# (C) 2026 GoodData Corporation

"""Integration tests for gooddata-code-convertors Python wrapper.

Requires the WASM binary to be built first:
    cd sdk/libs/sdk-code-convertors && npm run build-wasm
"""

import pytest

from gooddata_code_convertors import (
    ConversionError,
    yaml_metric_to_declarative,
    declarative_metric_to_yaml,
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


def test_conversion_error_on_unknown_function():
    from gooddata_code_convertors._wasm_runtime import call

    with pytest.raises(ConversionError, match="Unknown function"):
        call("nonExistentFunction")
