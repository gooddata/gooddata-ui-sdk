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

## Types: static (`_types`) vs. runtime-validating (`pydantic_models`)

Two parallel sets of Python types are generated from the same AAC JSON Schema:

- **`gooddata_code_convertors._types`** — `TypedDict`s, re-exported at the package top level
  (`from gooddata_code_convertors import Dashboard`). Static typing only, zero runtime cost,
  zero validation.
- **`gooddata_code_convertors.pydantic_models`** — real Pydantic v2 `BaseModel`s (not
  re-exported at the top level, to avoid name collisions with `_types` — import from the
  submodule directly: `from gooddata_code_convertors.pydantic_models import Dashboard`). Use
  these when you need actual runtime validation of a payload, e.g.
  `Dashboard.model_validate(payload)`.

**Gotcha:** shared string-pattern fields (e.g. every entity's `id`) are wrapped in their own
`RootModel[str]` class in `pydantic_models` rather than being plain `str` — access the value
via `.root` (e.g. `dashboard.id.root`). This is a deliberate trade-off: collapsing them into
plain `str` fields breaks import entirely, because pydantic-core's Rust regex engine can't
compile this schema's negative-lookahead patterns once collapsed. `_types`' `TypedDict`s are
unaffected (`Dashboard["id"]` is a plain `str` there, since `TypedDict` has no runtime pattern validation
to trip over).

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
