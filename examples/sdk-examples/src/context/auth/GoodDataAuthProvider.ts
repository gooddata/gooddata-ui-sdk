// (C) 2019-2022 GoodData Corporation
import sdk from "@gooddata/api-client-bear";
import { IAuthenticationProvider, IAuthenticatedPrincipal } from "@gooddata/sdk-backend-spi";
import { ANONYMOUS_ACCESS } from "../../constants/env";

export class GoodDataAuthProvider implements IAuthenticationProvider {
    public async logout(): Promise<any> {
        if (ANONYMOUS_ACCESS) {
            return;
        }
        return sdk.user.logout();
    }

    public async login(username: string, password: string): Promise<any> {
        if (ANONYMOUS_ACCESS) {
            return;
        }

        return sdk.user.login(username, password);
    }

    public async register(
        username: string,
        password: string,
        firstName: string,
        lastName: string,
    ): Promise<any> {
        if (ANONYMOUS_ACCESS) {
            return;
        }

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

        if (ANONYMOUS_ACCESS) {
            return {
                userId: "anonymous",
                userMeta: {
                    links: {
                        // we need the actual self link of the user from the proxy, this is needed by some of the API calls
                        self: user.links?.self,
                    },
                },
            };
        }

        return {
            userId: user.login!,
            userMeta: user,
        };
    }

    public async deauthenticate(): Promise<void> {
        // eslint-disable-next-line no-warning-comments
        // TODO: SDK8 Decide whether to implement this or remove it
    }

    public async getCurrentPrincipal(): Promise<IAuthenticatedPrincipal | null> {
        // eslint-disable-next-line no-warning-comments
        // TODO: SDK8 Decide whether to implement this or remove it
        return null;
    }
}
