{{- /* Markdown rendering of a home/client: one list item. */ -}}
- [{{ .Get "title" }}]({{ .Get "href" }}): {{ trim (replaceRE `\s+` " " .Inner) " " }}
