# (C) 2026 GoodData Corporation

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from types import ModuleType

GENERATOR_PATH = (
    Path(__file__).resolve().parent.parent / "scripts" / "generate_types.py"
)


def _load_generator() -> ModuleType:
    spec = importlib.util.spec_from_file_location("generate_types", GENERATOR_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    # Its dataclasses look their module up by name while the module runs.
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


generate_types = _load_generator()


def test_drops_an_else_branch_that_carries_keys_beside_its_not():
    union = {
        "type": "object",
        "required": ["using"],
        "oneOf": [
            {
                "if": {"properties": {"type": {"const": "metric"}}},
                "properties": {
                    "type": {"const": "metric"},
                    "using": {"type": "string"},
                },
                "additionalProperties": False,
            },
            {
                "if": {"properties": {"type": {"const": "metric"}}},
                "not": {},
                "properties": {"type": {"type": "string"}, "using": {"type": "string"}},
            },
        ],
    }

    resolved = generate_types.resolve_conditional_branches(union)

    assert resolved == {
        "oneOf": [
            {
                "properties": {
                    "type": {"const": "metric"},
                    "using": {"type": "string"},
                },
                "additionalProperties": False,
                "required": ["using"],
                "type": "object",
            }
        ]
    }
