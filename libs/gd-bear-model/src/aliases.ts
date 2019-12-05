// (C) 2007-2019 GoodData Corporation
// Type aliases, because string is too vague to represent some values

/**
 * @public
 */
export type Timestamp = string; // YYYY-MM-DD HH:mm:ss

/**
 * @public
 */
export type NumberAsString = string; // Number, but returned as a string

/**
 * @public
 */
export type Uri = string; // Metadata uri (f.e. /gdc/md/...)

/**
 * @public
 */
export type MaqlExpression = string; // Maql expression (f.e. SELECT [/gdc/md/...] IN [/gdc/md/...])
