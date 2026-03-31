# (C) 2026 GoodData Corporation

"""GoodData AAC YAML / Declarative API code converters (WASM-powered).

Provides bidirectional conversion between AAC YAML objects (used by
gdc-analytics-as-code VSCode plugin) and GoodData Declarative API format.

YAML-to-Declarative functions accept parsed YAML dicts (e.g. from yaml.safe_load),
not raw YAML strings. Declarative-to-YAML functions accept Declarative API dicts.
"""

from gooddata_code_convertors._wasm_runtime import ConversionError, call as _call

__all__ = [
    "ConversionError",
    # YAML -> Declarative
    "yaml_dataset_to_declarative",
    "yaml_date_dataset_to_declarative",
    "yaml_metric_to_declarative",
    "yaml_visualisation_to_declarative",
    "yaml_dashboard_to_declarative",
    "yaml_plugin_to_declarative",
    "yaml_attribute_hierarchy_to_declarative",
    # Declarative -> YAML
    "declarative_dataset_to_yaml",
    "declarative_date_instance_to_yaml",
    "declarative_metric_to_yaml",
    "declarative_visualisation_to_yaml",
    "declarative_dashboard_to_yaml",
    "declarative_plugin_to_yaml",
    "declarative_attribute_hierarchy_to_yaml",
    # Utilities
    "build_afm_execution",
]


# YAML -> Declarative


def yaml_dataset_to_declarative(*args) -> dict:
    """Convert a parsed dataset YAML dict to a declarative API dict."""
    return _call("yamlDatasetToDeclarative", *args)


def yaml_date_dataset_to_declarative(*args) -> dict:
    """Convert a parsed date dataset YAML dict to a declarative API dict."""
    return _call("yamlDateDatesetToDeclarative", *args)


def yaml_metric_to_declarative(*args) -> dict:
    """Convert a parsed metric YAML dict to a declarative API dict."""
    return _call("yamlMetricToDeclarative", *args)


def yaml_visualisation_to_declarative(*args) -> dict:
    """Convert a parsed visualisation YAML dict to a declarative API dict."""
    return _call("yamlVisualisationToDeclarative", *args)


def yaml_dashboard_to_declarative(*args) -> dict:
    """Convert a parsed dashboard YAML dict to a declarative API dict."""
    return _call("yamlDashboardToDeclarative", *args)


def yaml_plugin_to_declarative(*args) -> dict:
    """Convert a parsed plugin YAML dict to a declarative API dict."""
    return _call("yamlPluginToDeclarative", *args)


def yaml_attribute_hierarchy_to_declarative(*args) -> dict:
    """Convert a parsed attribute hierarchy YAML dict to a declarative API dict."""
    return _call("yamlAttributeHierarchyToDeclarative", *args)


# Declarative -> YAML


def declarative_dataset_to_yaml(*args) -> dict:
    """Convert a declarative dataset dict to YAML format."""
    return _call("declarativeDatasetToYaml", *args)


def declarative_date_instance_to_yaml(*args) -> dict:
    """Convert a declarative date instance dict to YAML format."""
    return _call("declarativeDateInstanceToYaml", *args)


def declarative_metric_to_yaml(*args) -> dict:
    """Convert a declarative metric dict to YAML format."""
    return _call("declarativeMetricToYaml", *args)


def declarative_visualisation_to_yaml(*args) -> dict:
    """Convert a declarative visualisation dict to YAML format."""
    return _call("declarativeVisualisationToYaml", *args)


def declarative_dashboard_to_yaml(*args) -> dict:
    """Convert a declarative dashboard dict to YAML format."""
    return _call("declarativeDashboardToYaml", *args)


def declarative_plugin_to_yaml(*args) -> dict:
    """Convert a declarative plugin dict to YAML format."""
    return _call("declarativePluginToYaml", *args)


def declarative_attribute_hierarchy_to_yaml(*args) -> dict:
    """Convert a declarative attribute hierarchy dict to YAML format."""
    return _call("declarativeAttributeHierarchyToYaml", *args)


# Utilities


def build_afm_execution(*args) -> dict:
    """Build an AFM execution request."""
    return _call("buildAfmExecution", *args)
