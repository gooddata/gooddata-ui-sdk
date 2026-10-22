{{- /* The Markdown version (index.md) of the API reference landing page and of each package page:
the package's summary and its symbols by kind (api-documenter's tables, md/tables.html), every
symbol linked to its own Markdown version. llms.txt lists the packages; this is the next step. */ -}}
{{ delimit (complement (slice "") (slice (partial "md/header.html" .) (partial "page-markdown.html" .))) "\n\n" }}
