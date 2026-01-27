// (C) 2023-2024 GoodData Corporation
import { getHost } from "../support/constants";

export const getTigerAuthToken = (): string => Cypress.env("TIGER_API_TOKEN");

interface IApiRequestOptions {
    failOnStatusCode?: boolean;
}

const defaultRequestOptions: IApiRequestOptions = {
    failOnStatusCode: true,
};

export class Api {
    static request(method: string, url: string, body?: any, options: IApiRequestOptions = {}): any {
        const { failOnStatusCode } = { ...defaultRequestOptions, ...options };
        return cy.request({
            method,
            failOnStatusCode,
            url: url.startsWith("/") ? `${getHost()}${url}` : url,
            headers: {
                Authorization: `BEARER ${getTigerAuthToken()}`,
                "Content-Type": "application/json",
            },
            body,
        });
    }

    static setEarlyAccess(workspace: string, value: string = "develop") {
        const body = {
            data: {
                id: workspace,
                type: "workspace",
                attributes: {
                    earlyAccess: value,
                },
            },
        };

        const url = `/api/v1/entities/workspaces/${workspace}`;

        return Api.request("PATCH", url, body);
    }

    static injectAuthHeader(userToken: string) {
        cy.log("Intercept to Inject Authorization header");
        cy.intercept("/api/**", { middleware: true }, (req) => {
            req.headers["Authorization"] = `Bearer ${userToken}`;
        });
    }
}
