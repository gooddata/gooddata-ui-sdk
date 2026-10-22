{{- /* dashboard-catalog in a page's Markdown copy: the same table, Beta / Alpha as plain text. */ -}}
{{ partial "dashboard-catalog-markdown.html" (dict "page" .Page "kind" (.Get 0) "plain" true) }}
