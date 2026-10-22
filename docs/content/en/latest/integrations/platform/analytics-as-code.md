---
title: Analytics as code
description: What GoodData means by analytics as code, which tools manage the analytics in a GoodData workspace as files, and how that work connects to a GoodData.UI application.
diataxis_type: explanation
type: docs
weight: 99
category: Integrations / Platform
section: Integrations
subsection: Platform
api_symbols:
  - "@gooddata/sdk-ui-ext:InsightView"
  - "@gooddata/sdk-ui-dashboard:Dashboard"
  - "@gooddata/sdk-ui-charts:BarChart"
  - "@gooddata/sdk-ui-pivot:PivotTable"
related_pages:
  - /docs/getting-started/quickstart
  - /docs/visualisations/insightview
  - /docs/integrations/platform/architecture-overview
ai_generated_description: true
ai_generated_body: true
---

GoodData.UI is the code that shows analytics in your application. The analytics themselves (the data model,
metrics, visualizations, and dashboards) live in a GoodData workspace, and GoodData lets you manage them as
code too. This page explains what that means, which tools do it, and where the two meet.

## What analytics as code means

Instead of building every metric and dashboard by hand in the GoodData web interface, you describe them in
text files and keep the files in a Git repository, next to your application code. Each object is a YAML file:

```yaml
type: metric
id: percent_revenue

title: "% Revenue"
description: Percent of Total Revenue

maql: SELECT {metric/revenue} / {metric/total_revenue}
format: "#,##0.0%"
```

With analytics in files, you can treat them the way you treat code:

- **Version control.** Every change is in the history: what changed, when, who changed it, and why. You can
  revert one.
- **Review.** Changes go through pull requests and code review, on GitHub, GitLab, or wherever your code lives.
- **Automation.** A CI/CD pipeline validates the files and deploys them to a workspace, for example to a test
  workspace on every pull request and to production on release.

The files cover datasets and date datasets (the logical data model), metrics written in MAQL,
visualizations, dashboards, and dashboard plugins. See
[Object Structures](https://www.gooddata.ai/docs/cloud/api-and-sdk/vs-code-extension/structures/) for the format
of each.

## The tools

| Tool | What it does | Docs |
| --- | --- | --- |
| GoodData for VS Code | An extension for Visual Studio Code: autocomplete, syntax highlighting, and validation for the YAML files, and a preview of most objects. | [GoodData for VS Code](https://www.gooddata.ai/docs/cloud/api-and-sdk/vs-code-extension/) |
| GoodData CLI (`gd`) | Sets up a project (`gd init`), downloads a workspace into files (`gd clone`), checks the files (`gd validate`), and deploys them to a workspace (`gd deploy`). Built for CI/CD pipelines. Install it with `npm i -g @gooddata/code-cli`. | [GoodData Command-line Interface](https://www.gooddata.ai/docs/cloud/api-and-sdk/vs-code-extension/cli/) |
| Python SDK | Reads datasets and metrics, computes visualizations, and helps you set up CI/CD pipelines and tests, from Python. | [GoodData Python SDK](https://www.gooddata.ai/docs/python-sdk/latest/) |
| REST API | GoodData is API-first: anything the tools do, you can do with the API from any language. | [API reference](https://www.gooddata.ai/docs/cloud/api-and-sdk/api/) |

{{% alert color="warning" title="Beta" %}}
GoodData for VS Code and the GoodData CLI are beta features. They don't support saved views, alerts, and
schedules yet. Check the current state in the [GoodData for VS Code](https://www.gooddata.ai/docs/cloud/api-and-sdk/vs-code-extension/)
docs before you rely on them in production.
{{% /alert %}}

To try it, follow [Get Started with GoodData for VS Code](https://www.gooddata.ai/docs/cloud/api-and-sdk/vs-code-extension/getting-started/).

## Where GoodData.UI fits

Analytics as code decides *what* the workspace contains. GoodData.UI decides *where and how* your application
shows it. The two meet at object IDs: the `id` in a YAML file is the ID your components load.

```tsx
// The visualization's YAML file has `id: revenue_by_region`
<InsightView insight="revenue_by_region" />

// The dashboard's YAML file has `id: sales_overview`
<Dashboard dashboard="sales_overview" />
```

Metrics and attributes work the same way when you build a visualization in code with `BarChart`, `PivotTable`,
and the other components, where a workspace metric becomes a measure. To catch a renamed or deleted object before your users do, generate typed constants
for the workspace with `@gooddata/catalog-export`, as the [quickstart](../../../getting-started/quickstart/)
does: an ID that no longer exists then fails the TypeScript build instead of an empty chart at runtime.

One way to wire the two together:

1. You change a metric in its YAML file and open a pull request.
2. CI runs `gd validate` on the files, and a reviewer approves the change.
3. On merge, CI runs `gd deploy` to update the workspace.
4. The application's build regenerates the catalog with `@gooddata/catalog-export` and compiles. If an ID the
   application uses is gone, the build fails here.
5. The application ships, and its components show the updated analytics.

Keeping the analytics files and the application in one repository lets a single pull request change both: for
example, a new metric and the chart that shows it.
