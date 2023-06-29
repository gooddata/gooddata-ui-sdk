// (C) 2022 GoodData Corporation
import { IInsight, ObjRef } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";

export function loadInsight(ctx: DashboardContext, insightRef: ObjRef): Promise<IInsight> {
    return ctx.backend.workspace(ctx.workspace).insights().getInsight(insightRef);
}
