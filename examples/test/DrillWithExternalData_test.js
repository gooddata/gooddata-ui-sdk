// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm } from "./utils/helpers";

fixture("Drill With External Data") // eslint-disable-line no-undef
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/drilling/drill-with-external-data`));

const stateTableCells = Selector(".s-state-table .s-table-cell");
const employeeTableCells = Selector(".s-employee-table .s-table-cell");
const employeeHeadingClearState = Selector(".s-employee-heading-clear-state");
const employeeHeadingClearLocation = Selector(".s-employee-heading-clear-location");
const salesHeadingClearState = Selector(".s-sales-heading-clear-state");
const salesHeadingClearLocation = Selector(".s-sales-heading-clear-location");
const salesBars = Selector(".s-sales-chart .highcharts-series > rect");
const employeeName = Selector(".s-employee-name");
const employeeProfile = Selector(".s-employee-profile");

test("should filter table and chart and display employee info", async t => {
    await t
        .click(stateTableCells.nth(0)) // Alabama
        .expect(salesBars.count)
        .eql(1)
        .expect(employeeTableCells.nth(0).textContent)
        .eql("Allen Garza");

    await t
        .click(employeeHeadingClearState) // clear
        .expect(salesBars.count)
        .eql(12)
        .expect(employeeTableCells.nth(0).textContent)
        .eql("Aaron Clements");

    await t
        .click(stateTableCells.nth(2)) // California
        .expect(salesBars.count)
        .eql(5)
        .expect(employeeTableCells.nth(0).textContent)
        .eql("Alex Meyer");

    await t
        .click(salesHeadingClearState) // clear
        .expect(salesBars.count)
        .eql(12)
        .expect(employeeTableCells.nth(0).textContent)
        .eql("Aaron Clements");

    await t
        .click(salesBars.nth(0)) // Aventura
        .expect(salesBars.count)
        .eql(1)
        .expect(employeeTableCells.nth(0).textContent)
        .eql("Audrey Diamond");

    await t
        .click(employeeHeadingClearLocation) // clear
        .expect(salesBars.count)
        .eql(12)
        .expect(employeeTableCells.nth(0).textContent)
        .eql("Aaron Clements");

    await t
        .click(salesBars.nth(2)) // Daly City
        .expect(salesBars.count)
        .eql(1)
        .expect(employeeTableCells.nth(0).textContent)
        .eql("Anna Spencer");

    await t
        .click(salesHeadingClearLocation) // clear
        .expect(salesBars.count)
        .eql(12)
        .expect(employeeTableCells.nth(0).textContent)
        .eql("Aaron Clements");

    await t
        .click(employeeTableCells.nth(0)) // Aaron Clements
        .expect(employeeProfile.exists)
        .ok()
        .expect(employeeName.textContent)
        .eql("Aaron Clements");
});
