---
title: AI & modules
weight: 50
description: AI features and high-level UI modules that you embed as React components.
diataxis_type: explanation
ai_generated_body: true
type: docs
---

These modules wrap whole product experiences into React components: the AI Assistant for conversational analytics, Semantic Search for finding analytical objects, the Analytics Catalog explorer, Key Driver Analysis, and the Notifications panel for alerts. Each module handles its own state, data loading, and UI, and reads the backend and workspace from the same `BackendProvider` and `WorkspaceProvider` as the rest of the SDK. They're published in dedicated packages such as `@gooddata/sdk-ui-gen-ai`, `@gooddata/sdk-ui-semantic-search`, `@gooddata/sdk-ui-catalog`, and `@gooddata/sdk-ui-ext`.

The AI modules show features that run in GoodData, so your organization must have them set up first. See [AI Assistant prerequisites](ai-assistant/#prerequisites).

The Automations list is an `@internal` API: it's documented here, but it isn't part of the public API and can change in any release.

To let an external AI client, such as Claude or Cursor, work with a GoodData workspace, use the [GoodData MCP server](https://www.gooddata.ai/docs/cloud/ai/mcp-server/), a GoodData Cloud feature outside GoodData.UI.
