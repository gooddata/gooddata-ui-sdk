// (C) 2022-2023 GoodData Corporation
import { getHost, getTigerAuthToken, getProjectId } from "../../support/constants";

class LocalizationApi {
    localeSettingViaAPI = (value: string, level: string) => {
        let url: string;
        if (level === "userSetting") {
            cy.request({
                method: "GET",
                url: `${getHost()}/api/v1/profile`,
                headers: {
                    "Content-Type": "application/vnd.gooddata.api+json",
                    Authorization: "Bearer " + getTigerAuthToken(),
                },
            }).should((response) => {
                expect(response.status).eq(200);
                url = `${getHost()}/api/v1/entities/users/${response.body.userId}/userSettings`;
                this.postRequest(url, value, level);
            });
        } else {
            if (level === "organizationSetting") {
                url = `${getHost()}/api/v1/entities/${level}s`;
            } else {
                url = `${getHost()}/api/v1/entities/workspaces/${getProjectId()}/workspaceSettings`;
            }
            this.postRequest(url, value, level);
        }
    };

    deleteLocaleSettingViaAPI = (level: string) => {
        let url: string;
        if (level === "userSetting") {
            cy.request({
                method: "GET",
                url: `${getHost()}/api/v1/profile`,
                headers: {
                    "Content-Type": "application/vnd.gooddata.api+json",
                    Authorization: "Bearer " + getTigerAuthToken(),
                },
            }).should((response) => {
                expect(response.status).eq(200);
                url = `${getHost()}/api/v1/entities/users/${response.body.userId}/userSettings/locale`;
                this.deleteRequest(url);
            });
        } else {
            if (level === "organizationSetting") {
                url = `${getHost()}/api/v1/entities/${level}s/locale`;
            } else {
                url = `${getHost()}/api/v1/entities/workspaces/${getProjectId()}/workspaceSettings/locale`;
            }
            this.deleteRequest(url);
        }
    };

    private postRequest = (url: string, value: string, level: string) => {
        cy.request({
            method: "POST",
            url: url,
            headers: {
                "Content-Type": "application/vnd.gooddata.api+json",
                Authorization: "Bearer " + getTigerAuthToken(),
            },
            body: {
                data: {
                    attributes: {
                        content: {
                            value: value,
                        },
                    },
                    id: "locale",
                    type: level,
                },
            },
        }).should((response) => {
            expect(response.status).eq(201);
        });
    };

    private deleteRequest = (url: string) => {
        cy.request({
            method: "DELETE",
            url: url,
            headers: {
                Authorization: "Bearer " + getTigerAuthToken(),
            },
        }).should((response) => {
            expect(response.status).eq(204);
        });
    };
}

export default LocalizationApi;
