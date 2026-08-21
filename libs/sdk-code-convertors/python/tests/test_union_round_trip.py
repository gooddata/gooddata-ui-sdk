# (C) 2026 GoodData Corporation

"""Round-trip contract tests for the generated schema unions (GDAI-2172).

Every union in the schema is written as `allOf` with one `if`/`then` per variant.
datamodel-code-generator does not implement `if`/`then`, so without the
resolve_conditional_branches() pre-process in scripts/generate_types.py it emits union
members that carry only the discriminator property. Such a member has no
extra='forbid', so it validates any payload with a matching `type` and drops every
other key on model_dump() — data loss instead of a validation error.

The tests assert three things:
  1. a valid payload survives validate -> dump with no key loss;
  2. a payload that matches no variant is rejected;
  3. no union member anywhere is a discriminator-only stub, including unions nested
     inside list[...] / dict[...], which a top-level `root` check does not see.
"""

from __future__ import annotations

import types
import typing

import pytest
from pydantic import BaseModel, RootModel, ValidationError

from gooddata_code_convertors import _types
from gooddata_code_convertors import pydantic_models
from gooddata_code_convertors.pydantic_models import (
    DashboardFilters,
    MvfCondition,
    DashboardFiltersNoGroups,
    Fields,
    Interaction,
    Metadata,
    QueryFilter,
    QuerySort,
)

QUERY_FILTERS = {
    "date_absolute": {
        "type": "date_filter",
        "using": "date_ds",
        "from": "2022-07-01",
        "to": "2022-09-30",
    },
    "date_relative": {
        "type": "date_filter",
        "using": "date_ds",
        "granularity": "MONTH",
        "from": -3,
        "to": 0,
    },
    "attribute": {
        "type": "attribute_filter",
        "using": "label/region",
        "state": {"include": ["East"]},
    },
    "text": {
        "type": "text_filter",
        "using": "label/name",
        "condition": "contains",
        "value": "abc",
        "case_sensitive": True,
    },
    "metric_value_comparison": {
        "type": "metric_value_filter",
        "using": "metric/revenue",
        "condition": "GREATER_THAN",
        "value": 5,
    },
    "metric_value_conditions": {
        "type": "metric_value_filter",
        "using": "metric/revenue",
        "conditions": [{"condition": "BETWEEN", "from": 1, "to": 2}],
    },
    "ranking": {
        "type": "ranking_filter",
        "using": "metric/revenue",
        "attribute": "label/region",
        "top": 3,
    },
}

EXPECTED_QUERY_FILTER_MODEL = {
    "date_absolute": "QueryDateFilter",
    "date_relative": "QueryDateFilter",
    "attribute": "QueryAttributeFilter",
    "text": "QueryTextFilter",
    "metric_value_comparison": "QueryMetricValueFilter",
    "metric_value_conditions": "QueryMetricValueFilter",
    "ranking": "QueryRankingFilter",
}

QUERY_SORTS = {
    "attribute_sort": {"type": "attribute_sort", "by": "a1", "direction": "ASC"},
    "metric_sort": {"type": "metric_sort", "metrics": ["m1"], "direction": "DESC"},
}

METADATA_OBJECTS = {
    "metric": {"type": "metric", "id": "revenue", "maql": "SELECT 1"},
    "dashboard": {"type": "dashboard", "id": "my_dash"},
    "dataset": {"type": "dataset", "id": "orders", "table_path": "public/orders"},
    "plugin": {"type": "plugin", "id": "p1", "url": "https://example.com/p.js"},
}

INTERACTIONS = {
    "open_plain_url": {"click_on": "m1", "open_url": "https://example.com"},
    "open_dashboard": {"click_on": "m1", "open_dashboard": "my_dash"},
}

# Unions nested inside dict[...] — invisible to a check that reads only `root`.
DASHBOARD_FILTERS = {
    "attribute": {"f1": {"type": "attribute_filter", "using": "label/region"}},
    "absolute_date": {
        "f1": {
            "type": "date_filter",
            "granularity": "DAY",
            "from": "2022-07-01",
            "to": "2022-09-30",
        }
    },
    "relative_date": {
        "f1": {"type": "date_filter", "granularity": "MONTH", "from": -3, "to": 0}
    },
    "text": {
        "f1": {
            "type": "text_filter",
            "using": "label/name",
            "condition": "contains",
            "value": "abc",
        }
    },
    "metric_value": {
        "f1": {
            "type": "metric_value_filter",
            "using": "metric/revenue",
            "conditions": [{"condition": "GREATER_THAN", "value": 1}],
            "null_values_as_zero": True,
        }
    },
}

# filter_group is the one variant DashboardFiltersNoGroups must NOT accept.
DASHBOARD_FILTER_GROUP = {
    "g1": {
        "type": "filter_group",
        "title": "Region",
        "filters": {"f1": {"type": "attribute_filter", "using": "label/region"}},
    }
}

FIELDS = {
    "attribute": {"a1": {"type": "attribute", "data_type": "STRING", "source_column": "region"}},
    "fact": {"f1": {"type": "fact", "data_type": "NUMERIC", "source_column": "amount"}},
}


def assert_no_key_loss(model: type[BaseModel], payload: dict) -> None:
    """A payload must survive validate -> dump with every key intact, at every level."""
    dumped = model.model_validate(payload).model_dump(
        mode="json", by_alias=True, exclude_none=True
    )
    assert _missing_keys(payload, dumped) == [], f"{model.__name__} dropped keys"


def _missing_keys(payload: object, dumped: object, path: str = "") -> list[str]:
    """Keys present in the payload that the dump does not carry, path-qualified."""
    if isinstance(payload, dict):
        if not isinstance(dumped, dict):
            return [path or "<root>"]
        missing = [f"{path}.{key}" for key in payload if key not in dumped]
        for key, value in payload.items():
            if key in dumped:
                missing.extend(_missing_keys(value, dumped[key], f"{path}.{key}"))
        return missing
    if isinstance(payload, list):
        if not isinstance(dumped, list) or len(dumped) != len(payload):
            return [path or "<root>"]
        missing = []
        for index, value in enumerate(payload):
            missing.extend(_missing_keys(value, dumped[index], f"{path}[{index}]"))
        return missing
    return []


@pytest.mark.parametrize("payload", QUERY_FILTERS.values(), ids=list(QUERY_FILTERS))
def test_query_filter_round_trip_keeps_every_key(payload):
    assert_no_key_loss(QueryFilter, payload)


@pytest.mark.parametrize("payload", QUERY_SORTS.values(), ids=list(QUERY_SORTS))
def test_query_sort_round_trip_keeps_every_key(payload):
    assert_no_key_loss(QuerySort, payload)


@pytest.mark.parametrize("payload", METADATA_OBJECTS.values(), ids=list(METADATA_OBJECTS))
def test_metadata_round_trip_keeps_every_key(payload):
    assert_no_key_loss(Metadata, payload)


@pytest.mark.parametrize("payload", INTERACTIONS.values(), ids=list(INTERACTIONS))
def test_interaction_round_trip_keeps_every_key(payload):
    assert_no_key_loss(Interaction, payload)


@pytest.mark.parametrize("payload", DASHBOARD_FILTERS.values(), ids=list(DASHBOARD_FILTERS))
@pytest.mark.parametrize("model", [DashboardFilters, DashboardFiltersNoGroups])
def test_dashboard_filters_round_trip_keeps_every_key(model, payload):
    assert_no_key_loss(model, payload)


def test_dashboard_filter_group_round_trip_keeps_every_key():
    assert_no_key_loss(DashboardFilters, DASHBOARD_FILTER_GROUP)


def test_dashboard_filters_no_groups_rejects_a_filter_group():
    with pytest.raises(ValidationError):
        DashboardFiltersNoGroups.model_validate(DASHBOARD_FILTER_GROUP)


@pytest.mark.parametrize("payload", FIELDS.values(), ids=list(FIELDS))
def test_fields_round_trip_keeps_every_key(payload):
    assert_no_key_loss(Fields, payload)


def test_query_filter_selects_the_model_for_its_type():
    """The union must resolve to the per-type model, not to a discriminator-only stub."""
    chosen = {
        name: type(QueryFilter.model_validate(payload).root).__name__
        for name, payload in QUERY_FILTERS.items()
    }
    assert chosen == EXPECTED_QUERY_FILTER_MODEL


@pytest.mark.parametrize(
    ("model", "payload"),
    [
        (QueryFilter, {"type": "date_filter", "not_a_filter_key": 1}),
        (QueryFilter, {"type": "attribute_filter"}),  # missing required `using`
        (QuerySort, {"type": "attribute_sort", "not_a_sort_key": 1}),
        (Metadata, {"type": "metric", "id": "revenue"}),  # missing required `maql`
        (Interaction, {"click_on": "m1", "not_an_interaction_key": 1}),
    ],
)
def test_union_rejects_payload_matching_no_variant(model, payload):
    with pytest.raises(ValidationError):
        model.model_validate(payload)


# One per schema def that sets `additionalProperties: false`. The keyword sits on the
# def, not on its if/then branch bodies, so the pre-process has to push it down into
# each branch. Dropping it instead turns extra='forbid' models into models that accept
# an unknown key and then discard it — the same silent loss, one level down.
UNKNOWN_KEY_PAYLOADS = {
    "date_absolute": {**QUERY_FILTERS["date_absolute"], "not_a_filter_key": 1},
    "date_relative": {**QUERY_FILTERS["date_relative"], "not_a_filter_key": 1},
    "attribute": {**QUERY_FILTERS["attribute"], "not_a_filter_key": 1},
    "ranking": {**QUERY_FILTERS["ranking"], "not_a_filter_key": 1},
}


@pytest.mark.parametrize(
    "payload", UNKNOWN_KEY_PAYLOADS.values(), ids=list(UNKNOWN_KEY_PAYLOADS)
)
def test_query_filter_rejects_an_unknown_key(payload):
    with pytest.raises(ValidationError):
        QueryFilter.model_validate(payload)


# The pre-process lifts `properties`/`required`/`additionalProperties`/`type` off a
# union node. A def may state any of them once and let its if/then bodies inherit it —
# $defs/dashboardAttributeFilter states `required: ["type", "using"]` and neither branch
# restates it — so they must be pushed down, not dropped. Dropping silently turns a
# constrained model into one that accepts anything and discards the difference.


@pytest.mark.parametrize(
    "payload",
    [
        {},  # nothing at all
        {"f1": {}},  # an empty filter object
        {"f1": {"type": "attribute_filter"}},  # missing required `using`
        {"f1": {"using": "label/region"}},  # missing required `type`
    ],
    ids=["empty_map", "empty_filter", "no_using", "no_type"],
)
def test_dashboard_filters_rejects_an_incomplete_attribute_filter(payload):
    if not payload:
        # An empty map is a valid (empty) filter collection; only the members are checked.
        assert DashboardFilters.model_validate(payload).root == {}
        return
    with pytest.raises(ValidationError):
        DashboardFilters.model_validate(payload)


@pytest.mark.parametrize(
    "payload",
    [
        {"condition": "GREATER_THAN", "value": 5},
        {"condition": "BETWEEN", "from": 1, "to": 2},
        {},  # the "All (no condition)" variant
    ],
    ids=["comparison", "range", "all"],
)
def test_mvf_condition_round_trip_keeps_every_key(payload):
    assert_no_key_loss(MvfCondition, payload)


@pytest.mark.parametrize(
    "payload",
    [
        {"condition": "GREATER_THAN", "value": 5, "not_a_condition_key": 1},
        {"condition": "NOT_A_CONDITION", "value": 5},
        {"not_a_condition_key": 1},
    ],
    ids=["unknown_key", "bad_condition", "arbitrary_mapping"],
)
def test_mvf_condition_rejects_payload_matching_no_variant(payload):
    """The union must not carry a free-form mapping member.

    A `dict[str, Any]` member matches any mapping, so it both accepts invalid
    conditions and absorbs payloads meant for a stricter sibling.
    """
    with pytest.raises(ValidationError):
        MvfCondition.model_validate(payload)


# Known gap, pre-existing and unchanged by this fix: datamodel-code-generator cannot
# express a conditional-required rule ("if `condition` is a comparison, `value` is
# required"), so the "All (no condition)" variant absorbs a condition-bearing payload
# that names no value. Ajv on $defs/mvfCondition rejects these; the models accept them.
# Closing it needs generated validators, and the pre-process removes the `if`/`then`
# the generator would need — tracked with the additionalProperties follow-up.
# strict=True on purpose: whoever closes it gets a failing XPASS telling them to
# delete this marker.


@pytest.mark.xfail(
    strict=True,
    reason="GDAI-2172 follow-up: no generated validator for conditional-required rules",
)
@pytest.mark.parametrize(
    "payload",
    [
        {"condition": "GREATER_THAN"},  # comparison without `value`
        {"condition": "BETWEEN"},  # range without `from`/`to`
    ],
    ids=["comparison_without_value", "range_without_bounds"],
)
def test_mvf_condition_rejects_an_incomplete_condition(payload):
    with pytest.raises(ValidationError):
        MvfCondition.model_validate(payload)


def _union_members(annotation: object) -> list[object]:
    """Flatten an annotation to the leaf types, through unions, list[...] and dict[...]."""
    origin = typing.get_origin(annotation)
    if origin in (typing.Union, types.UnionType, list, dict, set, tuple, frozenset):
        return [
            member
            for argument in typing.get_args(annotation)
            for member in _union_members(argument)
        ]
    return [annotation]


def _is_discriminator_only_model(member: object) -> bool:
    return (
        isinstance(member, type)
        and issubclass(member, BaseModel)
        and not issubclass(member, RootModel)
        and set(member.model_fields) == {"type"}
    )


def test_no_pydantic_union_member_is_a_discriminator_only_stub():
    """Walk nested annotations too: `Fields` and `DashboardFiltersNoGroups` hide their
    unions inside a dict value, where a plain `root` check does not reach them."""
    offenders = {}
    for name in dir(pydantic_models):
        model = getattr(pydantic_models, name)
        if not (isinstance(model, type) and issubclass(model, RootModel)):
            continue
        stubs = [
            member.__name__
            for member in _union_members(model.model_fields["root"].annotation)
            if _is_discriminator_only_model(member)
        ]
        if stubs:
            offenders[name] = stubs
    assert offenders == {}


def test_no_typed_dict_is_a_discriminator_only_stub():
    """_types.py has no runtime validation, so a truncated union there stays invisible
    until a caller reads a field the stub never declared."""
    stubs = [
        name
        for name in dir(_types)
        if typing.is_typeddict(getattr(_types, name))
        and set(getattr(_types, name).__annotations__) == {"type"}
    ]
    assert stubs == []
