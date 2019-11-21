// (C) 2007-2019 GoodData Corporation
// Type aliases, because string is too vague to represent some values
export type Timestamp = string; // YYYY-MM-DD HH:mm:ss
export type NumberAsString = string; // Number, but returned as a string
export type Uri = string; // Metadata uri (f.e. /gdc/md/...)
export type MaqlExpression = string; // Maql expression (f.e. SELECT [/gdc/md/...] IN [/gdc/md/...])
