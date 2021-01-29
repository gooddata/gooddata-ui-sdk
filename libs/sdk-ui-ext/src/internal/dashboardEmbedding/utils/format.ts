// (C) 2007-2021 GoodData Corporation

// Metric format is considered to represent value in percent when
// A) format string has no conditional separators (i.e. no semicolons
//    except a single one at the end); otherwise too difficult to parse :-(
// B) percentage symbol is found (not directly preceded by backslash)
export const isMetricFormatInPercent = (format = ""): boolean =>
    /^([^;]*)%([^;]*)[;]*$/.test(format.trim().replace(/\\%/g, ""));
