// (C) 2019-2025 GoodData Corporation
import { AxiosInstance } from "axios";
import { ApiEntitlement } from "./generated/metadata-json-api/index.js";
import { tigerEntitiesObjectsClientFactory } from "./entitiesObjects.js";

export type FeatureContext = {
    organizationId: string;
    earlyAccessValues: string[];
    tier: string;
    jsSdkVersion: string;
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

export interface ProfileApiInterface {
    getCurrent: () => Promise<IUserProfile>;
    getCurrentWithDetails: () => Promise<IUserProfile>;
}

export const tigerProfileClientFactory = (axios: AxiosInstance): ProfileApiInterface => {
    return {
        // TODO: replace with direct call of TigerClient (once methods are generated from OpenAPI)
        getCurrent: async (_detailed?: boolean) => {
            const response = await axios.get<IUserProfile>("/api/v1/profile");
            const deployment = response.headers?.["gooddata-deployment"];
            return {
                ...response.data,
                ...(deployment ? { deployment } : {}),
            };
        },
        getCurrentWithDetails: async (_detailed?: boolean) => {
            const response = await axios.get<IUserProfile>("/api/v1/profile");
            const profile = response.data;
            const deployment = response.headers?.["gooddata-deployment"];

            const details = await getUserDetails(axios, profile.userId);
            return {
                ...profile,
                ...details,
                ...(deployment ? { deployment } : {}),
            };
        },
    };
};

async function getUserDetails(axios: AxiosInstance, id: string) {
    const entitiesApi = tigerEntitiesObjectsClientFactory(axios);
    const user = (
        await entitiesApi.getEntityUsers({
            id,
        })
    ).data;

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
