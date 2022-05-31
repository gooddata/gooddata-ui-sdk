// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";

export interface IUserProfile {
    name: string;
    userId: string;
    organizationName: string;
    organizationId: string;
    links: {
        user: string;
        organization: string;
    };
}

export interface ProfileApiInterface {
    getCurrent: () => Promise<IUserProfile>;
}

export const tigerProfileClientFactory = (axios: AxiosInstance): ProfileApiInterface => {
    return {
        // TODO: replace with direct call of TigerClient (once methods are generated from OpenAPI)
        getCurrent: async () => (await axios.get<IUserProfile>("/api/v1/profile")).data,
    };
};
