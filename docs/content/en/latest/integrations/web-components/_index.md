---
title: Web Components
weight: 30
description: Custom HTML elements that embed GoodData dashboards, visualizations, and the AI assistant in any framework or vanilla HTML, without a direct React dependency.
diataxis_type: reference
type: docs
section: Integrations
subsection: Web Components
section_overview: true
---

Custom HTML elements (`gd-dashboard-embed`, `gd-insight-embed`, `gd-ai-assistant`, and others) that work in any framework or in plain HTML. A single `<script>` tag loads the runtime and sets the workspace context.

Web Components suit hosts that don't use React, or use a React version GoodData.UI doesn't support. In a React app, use the GoodData.UI React components instead. For new integrations, use `gd-dashboard-embed` and `gd-insight-embed`; the legacy `gd-dashboard` and `gd-insight` stay for existing integrations.
