// (C) 2021-2026 GoodData Corporation

export const content = `# Rolling Window
Use the ROWS BETWEEN keyword to specify a rolling window over which
running total functions (for example RUNAVG) are computed.

Running total functions such as RUNSUM, RUNAVG, RUNMIN and RUNMAX can be
specified with rolling window or a shifted boundary. An example could be
a moving average used with time series data to smooth out short-term
fluctuations and highlight longer-term trends or cycles.

ROWS BETWEEN does not currently support the COUNT or APPROXIMATE_COUNT function.

## Syntax

\`\`\`
SELECT (RUNNING TOTAL)(...) ROWS BETWEEN (...) AND (...)
SELECT RUNAVG (...) ROWS BETWEEN (…) AND (…)
\`\`\`

## Examples

**In the context of Date**

Define a moving average

\`\`\`
SELECT RUNAVG (Revenue) ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
\`\`\`

Return Year-to-Date (YTD) for Revenue:

\`\`\`
SELECT RUNSUM (Revenue) WITHIN Year (Opp. Close) ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
\`\`\`

Define five days preceding and the current date:

\`\`\`
 SELECT RUNAVG({metric}) ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
\`\`\`

\`\`\`
SELECT RUNAVG({metric}) ROWS BETWEEN 5 PRECEDING AND 1 PRECEDING
SELECT RUNAVG({metric}) ROWS BETWEEN 5 PRECEDING AND 1 FOLLOWING
\`\`\`

Display year to date - the same result as without specifying ROWS BETWEEN statement:

\`\`\`
SELECT RUNSUM({metric/m}) WITHIN {attribute/year} ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
\`\`\`

Define year to yesterday:

\`\`\`
SELECT RUNSUM({metric}/m) WITHIN {attribute/year} ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING ROW
\`\`\`

**In the context of Month**

Define the last twelve months:

\`\`\`
SELECT RUNSUM({metric/m}) ROWS BETWEEN 13 PRECEDING AND 1 PRECEDING
\`\`\`

Define everything before the current month:

\`\`\`
 SELECT RUNAVG({metric/m}) WITHIN {attribute/year} ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
\`\`\``;
