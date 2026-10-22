---
title: LLMs
description: The llms.txt index, the full text of the guides, and the Markdown version of every page, for LLMs and AI coding assistants.
diataxis_type: reference
category: Getting Started
type: docs
weight: 4
section: Getting Started
related_pages:
  - /docs/getting-started/quickstart
  - /docs/getting-started/installation
---

This documentation follows the [llms.txt](https://llmstxt.org/) convention, so AI coding assistants such as Cursor, GitHub Copilot, or Claude can read it as Markdown. Give your tool a URL, or paste a page into a prompt.

- [llms.txt](../../../llms.txt) is the index of the documentation: every guide page with a one-line description, then every package of the API reference. Start here when the model needs to find the right page.

- [llms-full.txt](../../../llms-full.txt) is the full text of every guide page in one Markdown file. Use it when your tool loads a whole documentation set at once, for example as a Cursor `@Docs` source.

- Every page is also available as Markdown. Append `index.md` to its URL, for example [`.../getting-started/installation/index.md`](../installation/index.md), to get the page without the site's navigation and styling. Links in a Markdown page point to the Markdown version of the linked page, so the model can follow them. Each HTML page also points to its Markdown version through a `<link rel="alternate" type="text/markdown">` tag.

- In the API reference, a package page lists the package's symbols, and each symbol has one Markdown page with all its properties and methods. For example, [`.../api-reference/sdk-ui/index.md`](../../api-reference/sdk-ui/index.md) lists the symbols of `@gooddata/sdk-ui`.

## Give the assistant access to your workspace

These files teach the assistant GoodData.UI. To let it work with your GoodData workspace as well, for example to find the identifiers of the dashboards, visualizations, and measures your code refers to, connect it to the [GoodData MCP server](https://www.gooddata.ai/docs/cloud/ai/mcp-server/). The server is part of GoodData Cloud; the Cloud documentation covers the setup for Claude Code, Cursor, VS Code, and other MCP clients.
