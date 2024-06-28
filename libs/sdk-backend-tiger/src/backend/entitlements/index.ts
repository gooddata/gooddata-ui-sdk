// (C) 2021-2024 GoodData Corporation

import { IEntitlements } from "@gooddata/sdk-backend-spi";
import { IEntitlementDescriptor } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";

const hardcodedEntitlements: IEntitlementDescriptor[] = [
    {
        name: "MaxAutomationRecipients",
        value: "10",
    },
    {
        name: "MaxAutomations",
        value: "10",
    },
    {
        name: "MinimumRecurrenceMinutes",
        value: "60",
    },
];

export class TigerEntitlements implements IEntitlements {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async resolveEntitlements(): Promise<IEntitlementDescriptor[]> {
        const profile = await this.authCall((client) => client.profile.getCurrent());
        const backendEntitlements =
            profile.entitlements ??
            (await this.authCall((client) => client.actions.resolveAllEntitlements())).data;
        return [...backendEntitlements, ...hardcodedEntitlements];
    }
}
