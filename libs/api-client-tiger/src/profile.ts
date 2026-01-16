// (C) 2019-2026 GoodData Corporation

import { type AxiosInstance } from "axios";

import { type ApiEntitlement, EntitiesApi_GetEntityUsers } from "./generated/metadata-json-api/index.js";

export type FeatureContext = {
    organizationId: string;
    earlyAccessValues: string[];
    tier: string;
    jsSdkVersion: string;
    controlledFeatureRollout: boolean;
};

export interface ILiveFeatures {
    live: {
        configuration: {
            host: string;
            key: string;
        };
        context: FeatureContext;
    };
}

/**
 * @internal
 */
export function isLiveFeatures(
    features: ILiveFeatures | IStaticFeatures | undefined,
): features is ILiveFeatures {
    return (features as ILiveFeatures)?.live !== undefined;
}

export interface IStaticFeatures {
    static: {
        items: Record<string, string>;
        context: FeatureContext;
    };
}

/**
 * @internal
 */
export function isStaticFeatures(
    features: ILiveFeatures | IStaticFeatures | undefined,
): features is IStaticFeatures {
    return (features as IStaticFeatures)?.static !== undefined;
}

export interface IUserProfile {
    name: string;
    userId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    organizationName: string;
    organizationId: string;
    links: {
        user: string;
        organization: string;
    };
    features?: ILiveFeatures | IStaticFeatures;
    permissions?: string[];
    entitlements: ApiEntitlement[]; // reuse better type from metadata-api instead of original from auth-api
    deployment?: string;
}

export type ProfileApiInterface = {
    getCurrent: () => Promise<IUserProfile>;
    getCurrentWithDetails: () => Promise<IUserProfile>;
};

export const tigerProfileClientFactory = (axios: AxiosInstance): ProfileApiInterface => {
    return {
        getCurrent: async (_detailed?: boolean) => {
            return ProfileApi_GetCurrent(axios, _detailed);
        },
        getCurrentWithDetails: async (_detailed?: boolean) => {
            return ProfileApi_GetCurrentWithDetails(axios, _detailed);
        },
    };
};

// TODO: replace with direct call of TigerClient (once methods are generated from OpenAPI)
export async function ProfileApi_GetCurrent(axios: AxiosInstance, _detailed?: boolean) {
    const response = await axios.get<IUserProfile>("/api/v1/profile");
    const deployment = response.headers?.["gooddata-deployment"];
    return {
        ...response.data,
        ...(deployment ? { deployment } : {}),
    };
}

export async function ProfileApi_GetCurrentWithDetails(axios: AxiosInstance, _detailed?: boolean) {
    const response = await axios.get<IUserProfile>("/api/v1/profile");
    const profile = response.data;
    const deployment = response.headers?.["gooddata-deployment"];

    const details = await getUserDetails(axios, profile.userId);
    return {
        ...profile,
        ...details,
        ...(deployment ? { deployment } : {}),
    };
}

async function getUserDetails(axios: AxiosInstance, id: string) {
    const response = await EntitiesApi_GetEntityUsers(axios, "", {
        id,
    });

    const user = response.data;

    const firstName = user.data.attributes?.firstname;
    const lastName = user.data.attributes?.lastname;
    const email = user.data.attributes?.email;

    return {
        ...(firstName &&
            lastName && {
                name: `${firstName} ${lastName}`,
                firstName,
                lastName,
            }),
        ...(email && {
            email,
        }),
    };
}
