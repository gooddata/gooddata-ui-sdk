// (C) 2019-2020 GoodData Corporation
import sdk from "@gooddata/api-client-bear";
import { IAuthenticationProvider } from "@gooddata/sdk-backend-spi";

export class GoodDataAuthProvider implements IAuthenticationProvider {
    public async logout() {
        return sdk.user.logout();
    }

    public async login(username: string, password: string) {
        return sdk.user.login(username, password);
    }

    public async register(username: string, password: string, firstName: string, lastName: string) {
        return sdk.xhr.post("/api/register", {
            data: {
                login: username,
                password,
                email: username,
                verifyPassword: password,
                firstName,
                lastName,
            },
        });
    }

    public async authenticate() {
        const user = await sdk.user.getCurrentProfile();

        return {
            userId: user.login,
            userMeta: user,
        };
    }

    public async deauthenticate() {
        // TODO: SDK8 Decide whether to implement this or remove it
    }

    public async getCurrentPrincipal() {
        // TODO: SDK8 Decide whether to implement this or remove it
        return null;
    }
}
