// (C) 2023 GoodData Corporation
import { Api, getTigerAuthToken } from "./api";

export class Users {
    constructor() {}

    static createUser(id: string, groups: string[]) {
        const data = groups.map((groupId) => {
            return {
                id: groupId,
                type: "userGroup",
            };
        });
        const body = {
            data: {
                id,
                type: "user",
                attributes: {
                    authenticationId: `authId_${id}`,
                },
                relationships: {
                    userGroups: {
                        data,
                    },
                },
            },
        };
        const url = `/api/v1/entities/users`;
        Api.request("POST", url, body);
        return this;
    }

    static createGroup(id: string) {
        const body = {
            data: {
                attributes: {},
                id,
                type: "userGroup",
            },
        };

        const url = `/api/v1/entities/userGroups`;
        Api.request("POST", url, body);
        return this;
    }

    static deleteGroup(id: string) {
        const url = `/api/v1/entities/userGroups/${id}`;
        Api.request("DELETE", url, undefined, { failOnStatusCode: false });
        return this;
    }

    static switchToUser(id: string) {
        const body = {
            data: {
                id,
                type: "apiToken",
                attributes: {},
            },
        };
        Api.request("POST", `/api/v1/entities/users/${id}/apiTokens`, body).then((res: any) => {
            const body = res.body;
            expect(res.status).eq(201);
            const token = body.data.attributes.bearerToken;
            Api.injectAuthHeader(token);
        });
    }

    static switchToDefaultUser() {
        Api.injectAuthHeader(getTigerAuthToken());
        return this;
    }

    static deleteUser(id: string) {
        const url = `/api/v1/entities/users/${id}`;
        Api.request("DELETE", url, undefined, { failOnStatusCode: false });
        return this;
    }
}
