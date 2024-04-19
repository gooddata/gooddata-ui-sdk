// (C) 2021-2024 GoodData Corporation

import {
    IOrganization,
    IOrganizations,
    IOrganizationSettingsService,
    IOrganizationStylingService,
    ISecuritySettingsService,
    IOrganizationUserService,
    IOrganizationPermissionService,
} from "@gooddata/sdk-backend-spi";
import { IOrganizationDescriptor, idRef, IOrganizationDescriptorUpdate } from "@gooddata/sdk-model";

import { SecuritySettingsService } from "./securitySettings.js";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { OrganizationStylingService } from "./styling.js";
import { OrganizationSettingsService } from "./settings.js";
import { OrganizationUsersService } from "./users.js";
import { OrganizationPermissionService } from "./permissions.js";

export class TigerOrganization implements IOrganization {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly organizationId: string,
        public readonly organizationName?: string,
    ) {}

    public async getDescriptor(includeAdditionalDetails?: boolean): Promise<IOrganizationDescriptor> {
        // if we already have the data, no reason to download them again
        if (this.organizationName && !includeAdditionalDetails) {
            return {
                id: this.organizationId,
                title: this.organizationName,
            };
        }

        if (includeAdditionalDetails) {
            const result = await this.authCall((client) =>
                client.entities.getEntityOrganizations({
                    id: this.organizationId,
                    // we are interested only in these for now (can be extended in future)
                    include: ["bootstrapUser", "bootstrapUserGroup"],
                }),
            );

            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            const organizationName = result.data.data.attributes?.name!;
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            const bootstrapUser = result.data.data?.relationships?.bootstrapUser?.data!;
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            const bootstrapUserGroup = result.data.data?.relationships?.bootstrapUserGroup?.data!;

            return {
                id: this.organizationId,
                title: organizationName,
                bootstrapUser: idRef(bootstrapUser.id, bootstrapUser.type),
                bootstrapUserGroup: idRef(bootstrapUserGroup.id, bootstrapUserGroup.type),
                earlyAccess: result.data.data.attributes?.earlyAccess,
            };
        }

        const { organizationName, organizationId } = await this.authCall((client) =>
            client.profile.getCurrent(),
        );
        return {
            id: organizationId,
            title: organizationName,
        };
    }

    public async updateDescriptor(descriptor: IOrganizationDescriptorUpdate): Promise<void> {
        await this.authCall((client) =>
            client.entities.patchEntityOrganizations({
                id: this.organizationId,
                jsonApiOrganizationPatchDocument: {
                    data: {
                        id: this.organizationId,
                        type: "organization",
                        attributes: {
                            name: descriptor.title,
                            // type casts are necessary because nulls are not allowed in the type definition,
                            // but backend expects them in case we want to delete the value
                            earlyAccess: descriptor.earlyAccess as string | undefined,
                        },
                    },
                },
            }),
        );
    }

    public securitySettings(): ISecuritySettingsService {
        return new SecuritySettingsService(this.organizationId);
    }

    public styling(): IOrganizationStylingService {
        return new OrganizationStylingService(this.authCall);
    }

    public settings(): IOrganizationSettingsService {
        return new OrganizationSettingsService(this.authCall);
    }

    public users(): IOrganizationUserService {
        return new OrganizationUsersService(this.authCall);
    }

    public permissions(): IOrganizationPermissionService {
        return new OrganizationPermissionService(this.authCall);
    }
}

export class TigerOrganizations implements IOrganizations {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getCurrentOrganization(): Promise<IOrganization> {
        const { organizationName, organizationId } = await this.authCall((client) =>
            client.profile.getCurrent(),
        );
        return new TigerOrganization(this.authCall, organizationId, organizationName);
    }
}
