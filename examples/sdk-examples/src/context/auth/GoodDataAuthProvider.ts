// (C) 2019-2020 GoodData Corporation
import sdk from "@gooddata/api-client-bear";
import { IAuthenticationProvider, AuthenticatedPrincipal } from "@gooddata/sdk-backend-spi";

export class GoodDataAuthProvider implements IAuthenticationProvider {
    public async logout(): Promise<any> {
        return sdk.user.logout();
    }

    public async login(username: string, password: string): Promise<any> {
        return sdk.user.login(username, password);
    }

    public async register(
        username: string,
        password: string,
        firstName: string,
        lastName: string,
    ): Promise<any> {
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

    public async authenticate(): Promise<{
        userId: string;
        userMeta: any;
    }> {
        const user = await sdk.user.getCurrentProfile();

        return {
            userId: user.login!,
            userMeta: user,
        };
    }

    public async deauthenticate(): Promise<void> {
        // eslint-disable-next-line no-warning-comments
        // TODO: SDK8 Decide whether to implement this or remove it
    }

    public async getCurrentPrincipal(): Promise<AuthenticatedPrincipal | null> {
        // eslint-disable-next-line no-warning-comments
        // TODO: SDK8 Decide whether to implement this or remove it
        return null;
    }
}
