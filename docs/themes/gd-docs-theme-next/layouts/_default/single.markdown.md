{{- /* A page's Markdown version, served as index.md next to its index.html: the llms.txt
convention's "LLM-friendly" version of the page (https://llmstxt.org/). The site enables it with an
output format named `markdown` (docs/site-config.md §3); head.html links it as rel="alternate".
The body comes from page-markdown.html. */ -}}
{{ delimit (complement (slice "") (slice (partial "md/header.html" .) (partial "page-markdown.html" .))) "\n\n" }}
