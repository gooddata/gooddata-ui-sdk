{{- /* embedded-image in a page's Markdown copy: a Markdown image, the caption as its alt text when no
alt is set. The src stays as written; page-markdown.html makes it absolute with every other link. */ -}}
{{- $src := .Get "src" -}}
{{- /* Square brackets in the text would end the image's alt early. */ -}}
{{- $alt := or (.Get "alt") (.Get "caption" | plainify) | replaceRE `([\[\]])` `\$1` -}}
![{{ $alt }}]({{ $src }})
{{- with .Get "caption" }}

*{{ . }}*
{{- end }}
