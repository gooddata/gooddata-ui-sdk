{{- /* Markdown rendering of a home/link (also used by home/client): one list item. */ -}}
- [{{ .Get "title" }}]({{ .Get "href" }}): {{ trim (replaceRE `\s+` " " .Inner) " " }}
