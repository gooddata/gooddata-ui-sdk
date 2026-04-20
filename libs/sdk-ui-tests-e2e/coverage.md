# SDK E2E Test Coverage Gaps

## Completely Missing from Test App + E2E

| Component/Feature    | SDK Package | Notes                     |
| -------------------- | ----------- | ------------------------- |
| Execute / RawExecute | sdk-ui      | Data execution components |

## Have Scenarios but Very Thin Feature Coverage

| Area                 | What's Tested             | What's Missing                                                                          |
| -------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| PivotTable           | Only transpose layouts    | Basic rendering, sorting, column sizing, totals/subtotals, pagination, menu config      |
| Chart interactions   | Rendering only            | Tooltip content, click/drill from chart elements, hover states                          |
| Chart config         | Default configs           | Custom color palettes, legend positioning (top/bottom/left/right), sorting, axis config |
| Drilling             | Dashboard-level only      | Chart-level onDrill callback, drill to URL, drill to dashboard                          |
| Error/loading states | Invalid insight scenario  | Component-level error boundaries, custom loading indicators                             |
| Export               | Dashboard PDF export only | Chart image export, data export (CSV/XLSX)                                              |
| Localization         | Header section only       | Chart/filter/table label translations                                                   |
