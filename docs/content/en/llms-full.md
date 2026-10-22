---
# llms-full.txt: every guide page in one Markdown file, for tools that ingest a site's docs at once
# (Cursor's @Docs, RAG pipelines; Anthropic, Vercel, Supabase, Mantine publish one). Rendered by
# layouts/llms-full.markdown.md in the MARKDOWN output format, so shortcodes come out through the
# same *.markdown.md templates as each page's own index.md. Not a page of the site: no HTML, no
# listing, no sitemap entry; llms.txt links it under ## Optional.
title: GoodData.UI SDK Documentation (full text)
outputs: [MARKDOWN]
url: /llms-full.txt
layout: llms-full
build:
    list: never
sitemap:
    disable: true
---
