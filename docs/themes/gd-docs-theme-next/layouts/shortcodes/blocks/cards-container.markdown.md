{{- /* Markdown rendering of a card grid: its cards (blocks/card.markdown.md), one list item each. */ -}}
{{- trim (replaceRE `\n\s*\n` "\n" (.Inner | string)) " \r\n" -}}
