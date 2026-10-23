---
title: Customize date filter presets
category: Filters
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-model:IDateFilterConfig"
  - "@gooddata/sdk-model:IRelativeDateFilterPreset"
related_pages:
  - /docs/filters/date-filter
  - /docs/dashboard-plugins/dashboard
  - /docs/filters/filter-visual-components
description: Change the granularities and presets that dashboard date filters offer by creating the dateFilterConfig organization or workspace setting.
ai_generated_body: true
type: docs
weight: 41
section: Filters
---

Dashboard date filters read their options from the `dateFilterConfig` setting. Create the setting to choose which granularities the relative period form offers and which presets, such as "Last 10 days" or "Year to date", the dropdown lists. Without the setting, dashboards use the default configuration.

The setting changes dashboards only. A standalone [`DateFilter`](../date-filter/) takes its options from the `filterOptions` and `availableGranularities` props.

## Choose the level

You can create `dateFilterConfig` at two levels. A workspace setting overrides the organization setting.

| Level | Endpoint | `type` in the payload |
| --- | --- | --- |
| Organization | `/api/v1/entities/organizationSettings` | `organizationSetting` |
| Workspace | `/api/v1/entities/workspaces/<workspace-id>/workspaceSettings` | `workspaceSetting` |

## Create the setting

Send a `POST` request to the endpoint of the level you chose. Put the configuration in `attributes.content.config`:

```json
{
    "data": {
        "id": "dateFilterConfig",
        "type": "organizationSetting",
        "attributes": {
            "type": "DATE_FILTER_CONFIG",
            "content": {
                "config": {
                    "selectedOption": "relative_last_30_days",
                    "allTime": {
                        "localIdentifier": "allTime",
                        "name": "All time",
                        "visible": true
                    },
                    "absoluteForm": {
                        "localIdentifier": "absoluteForm",
                        "name": "",
                        "visible": true
                    },
                    "relativeForm": {
                        "localIdentifier": "relativeForm",
                        "name": "",
                        "visible": true,
                        "granularities": [
                            "GDC.time.date",
                            "GDC.time.week_us",
                            "GDC.time.month",
                            "GDC.time.quarter",
                            "GDC.time.year"
                        ]
                    },
                    "relativePresets": [
                        {
                            "localIdentifier": "relative_last_7_days",
                            "name": "Last 7 days",
                            "granularity": "GDC.time.date",
                            "from": -6,
                            "to": 0,
                            "visible": true
                        },
                        {
                            "localIdentifier": "relative_last_30_days",
                            "name": "Last 30 days",
                            "granularity": "GDC.time.date",
                            "from": -29,
                            "to": 0,
                            "visible": true
                        }
                    ]
                }
            }
        }
    }
}
```

`selectedOption` is the `localIdentifier` of the option that dashboards select by default. It must match an option that the configuration defines.

## Choose the granularities

`relativeForm.granularities` lists the granularities users can pick in the relative period form. Remove an item to hide it. The date filter supports these values:

- `GDC.time.second`, `GDC.time.minute`, `GDC.time.hour`
- `GDC.time.date`
- `GDC.time.week_us` (weeks starting on Sunday)
- `GDC.time.month`, `GDC.time.fiscal_month`
- `GDC.time.quarter`, `GDC.time.fiscal_quarter`
- `GDC.time.year`, `GDC.time.fiscal_year`

Other values are ignored. `GDC.time.week` (weeks starting on Monday) works in [relative date filters](../filter-visual-components/#relative-date-filter) that you build in code, but not in the date filter configuration.

For example, to offer only months and years:

```json
{
    "localIdentifier": "relativeForm",
    "name": "",
    "visible": true,
    "granularities": ["GDC.time.month", "GDC.time.year"]
}
```

## Add presets

Each item in `relativePresets` is one preset in the dropdown:

- `granularity`: the time unit, such as `GDC.time.date` or `GDC.time.month`.
- `from` and `to`: the range in units relative to the current one, where `0` is the current day, month, and so on. "Last 3 days" including today is `from: -2, to: 0`. "This year" is `from: 0, to: 0`.
- `localIdentifier`: a unique ID of the preset.
- `name`: the label shown on the dashboard.
- `visible`: whether the dropdown shows the preset.

For example, "Last 10 days" including today:

```json
{
    "localIdentifier": "last_10_days",
    "name": "Last 10 days",
    "granularity": "GDC.time.date",
    "from": -9,
    "to": 0,
    "visible": true
}
```

## Add "to date" presets

A "to date" preset, such as "Year to date", selects the current period and ends it today. Add a `boundedFilter` to a preset that selects the current period:

```json
{
    "localIdentifier": "year_to_date",
    "name": "Year to date",
    "granularity": "GDC.time.year",
    "from": 0,
    "to": 0,
    "visible": true,
    "boundedFilter": {
        "granularity": "GDC.time.date",
        "to": 0
    }
}
```

`boundedFilter` takes a `granularity` (typically `GDC.time.date`) and one bound:

| Property | Type | Description |
| --- | --- | --- |
| `granularity` | `DateAttributeGranularity` | The granularity of the bound. |
| `to` | `number` | Upper bound. Use `0` for today to create a "to date" preset. |
| `from` | `number` | Lower bound. Use `0` for today to create a "from date" preset. |

{{% alert color="warning" title="One bound only" %}}
Set either `from` or `to` in `boundedFilter`, not both.
{{% /alert %}}

For "Quarter to date", "Month to date", and "Week to date", use the same preset with `granularity` set to `GDC.time.quarter`, `GDC.time.month`, or `GDC.time.week_us`.

## Delete the setting

To go back to the default configuration, send a `DELETE` request:

- Organization: `/api/v1/entities/organizationSettings/dateFilterConfig`
- Workspace: `/api/v1/entities/workspaces/<workspace-id>/workspaceSettings/dateFilterConfig`
