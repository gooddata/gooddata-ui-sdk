// (C) 2019 GoodData Corporation
import sdk from "@gooddata/gd-bear-client";
import { IAuthenticationProvider } from "@gooddata/sdk-backend-spi";

export class GoodDataAuthProvider implements IAuthenticationProvider {
    public async logout() {
        return sdk.user.logout();
    }

    public async login(username: string, password: string) {
        return sdk.user.login(username, password);
    }

    public async authenticate() {
        const user = await sdk.user.getCurrentProfile();

        return {
            userId: user.login,
            userMeta: user,
        };
    }
}
