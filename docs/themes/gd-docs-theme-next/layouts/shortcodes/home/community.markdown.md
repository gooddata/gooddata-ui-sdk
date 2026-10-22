{{- /* Markdown rendering of the home/community row: the title, then its links as a list. */ -}}
{{ .Get "title" }}:

{{ trim (replaceRE `\n\s*\n` "\n" (.Inner | string)) " \r\n" }}
