// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Drill With External Data")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/drilling/drill-with-external-data`));

const employeeHeadingClearState = Selector(".s-employee-heading-clear-state");
const employeeHeadingClearLocation = Selector(".s-employee-heading-clear-location");
const salesHeadingClearState = Selector(".s-sales-heading-clear-state");
const salesHeadingClearLocation = Selector(".s-sales-heading-clear-location");
const salesBars = Selector(".s-sales-chart .highcharts-series > rect");
const employeeName = Selector(".s-employee-name");
const employeeProfile = Selector(".s-employee-profile");

const nthState = (n) => Selector(`.s-state-table .ag-body-viewport .s-cell-${n}-0`);
const firstEmployee = Selector(".s-employee-table .ag-body-viewport .s-cell-0-0");

test("should filter table and chart and display employee info", async (t) => {
    await t
        .click(nthState(0)) // Alabama
        .expect(salesBars.count)
        .eql(1)
        .expect(firstEmployee.textContent)
        .eql("Allen Garza");

    await t
        .click(employeeHeadingClearState) // clear
        .expect(salesBars.count)
        .eql(12)
        .expect(firstEmployee.textContent)
        .eql("Aaron Clements");

    await t
        .click(nthState(1)) // California
        .expect(salesBars.count)
        .eql(5)
        .expect(firstEmployee.textContent)
        .eql("Alex Meyer");

    await t
        .click(salesHeadingClearState) // clear
        .expect(salesBars.count)
        .eql(12)
        .expect(firstEmployee.textContent)
        .eql("Aaron Clements");

    await t
        .click(salesBars.nth(0)) // Aventura
        .expect(salesBars.count)
        .eql(1)
        .expect(firstEmployee.textContent)
        .eql("Audrey Diamond");

    await t
        .click(employeeHeadingClearLocation) // clear
        .expect(salesBars.count)
        .eql(12)
        .expect(firstEmployee.textContent)
        .eql("Aaron Clements");

    await t
        .click(salesBars.nth(2)) // Daly City
        .expect(salesBars.count)
        .eql(1)
        .expect(firstEmployee.textContent)
        .eql("Anna Spencer");

    await t
        .click(salesHeadingClearLocation) // clear
        .expect(salesBars.count)
        .eql(12)
        .expect(firstEmployee.textContent)
        .eql("Aaron Clements");

    await t
        .click(firstEmployee) // Aaron Clements
        .expect(employeeProfile.exists)
        .ok()
        .expect(employeeName.textContent)
        .eql("Aaron Clements");
});
