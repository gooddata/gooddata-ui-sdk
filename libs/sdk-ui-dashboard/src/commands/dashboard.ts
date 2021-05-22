// (C) 2021 GoodData Corporation

export type DashboardCommandType = "GDC.CMD.LOAD.DASHBOARD";

//
//
//

export interface IDashboardCommand {
    type: DashboardCommandType;
}

export interface LoadDashboard extends IDashboardCommand {
    type: "GDC.CMD.LOAD.DASHBOARD";
}

export function loadDashboard(): LoadDashboard {
    return {
        type: "GDC.CMD.LOAD.DASHBOARD",
    };
}

//
//
//

export type DashboardCommands = LoadDashboard;
