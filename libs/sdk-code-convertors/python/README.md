# gooddata-code-convertors

GoodData AAC YAML / Declarative API code converters, powered by WebAssembly.

Provides bidirectional conversion between AAC YAML format (used by the
[gdc-analytics-as-code](https://marketplace.visualstudio.com/items?itemName=GoodData.gooddata-code) VSCode plugin)
and GoodData Declarative API format.

## Installation

```bash
pip install gooddata-code-convertors
```

## Usage

YAML-to-Declarative functions accept **parsed YAML dicts** (e.g. from `yaml.safe_load`),
not raw YAML strings.

```python
import yaml
from gooddata_code_convertors import yaml_metric_to_declarative, declarative_metric_to_yaml

# AAC YAML -> Declarative API
with open("metrics/revenue.yaml") as f:
    parsed = yaml.safe_load(f)
declarative = yaml_metric_to_declarative(parsed)

# Declarative API -> AAC YAML
yaml_result = declarative_metric_to_yaml(declarative)
```

## Available Converters

### YAML -> Declarative API

- `yaml_dataset_to_declarative`
- `yaml_date_dataset_to_declarative`
- `yaml_metric_to_declarative`
- `yaml_visualisation_to_declarative`
- `yaml_dashboard_to_declarative`
- `yaml_plugin_to_declarative`
- `yaml_attribute_hierarchy_to_declarative`

### Declarative API -> YAML

- `declarative_dataset_to_yaml`
- `declarative_date_instance_to_yaml`
- `declarative_metric_to_yaml`
- `declarative_visualisation_to_yaml`
- `declarative_dashboard_to_yaml`
- `declarative_plugin_to_yaml`
- `declarative_attribute_hierarchy_to_yaml`

### Utilities

- `build_afm_execution`
