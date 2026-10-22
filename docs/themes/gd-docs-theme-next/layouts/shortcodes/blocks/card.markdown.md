{{- /* Markdown rendering of a card: one list item, the title linked to the card's target, the
eyebrow in parentheses, then the body on the same line. A relative link stays as written;
page-markdown.html makes it absolute against the page, as the HTML card's href resolves. */ -}}
{{- $title := or (.Get "title") (.Get "header") -}}
{{- $href := or (.Get "link") (.Get "url") (.Get "extLink") -}}
{{- $body := trim (replaceRE `\s+` " " (.Inner | string)) " " -}}
{{- $label := "" -}}
{{- with $title -}}
  {{- $label = printf "**%s**" . -}}
  {{- with $href }}{{ $label = printf "**[%s](%s)**" $title . }}{{ end -}}
{{- end -}}
{{- with .Get "eyebrow" }}{{ $label = printf "%s (%s)" $label . }}{{ end -}}
- {{ $label }}{{ with $body }}{{ if $label }}: {{ end }}{{ . }}{{ end }}
