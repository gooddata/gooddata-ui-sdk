// (C) 2019 GoodData Corporation
import { config } from "./utils/config";
import { loginUsingLoginForm, checkCellValue } from "./utils/helpers";

fixture
    .only("Pivot Table XSS") // eslint-disable-line no-undef
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/hidden/pivot-table-xss`));

test("should render items HTML escaped", async t => {
    await checkCellValue(t, ".s-pivot-table-xss", "1,406,548 <img />", ".s-cell-0-1");
    await checkCellValue(t, ".s-pivot-table-xss", "4,334,353 <img />", ".s-cell-0-1", ".ag-floating-bottom");
});
