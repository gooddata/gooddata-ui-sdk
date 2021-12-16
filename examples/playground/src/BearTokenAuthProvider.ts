// (C) 2021 GoodData Corporation

import { BearAuthProviderBase } from "@gooddata/sdk-backend-bear";
import {
    IAuthenticatedPrincipal,
    IAuthenticationContext,
    IAuthenticationProvider,
} from "@gooddata/sdk-backend-spi";

export class BearTokenAuthProvider extends BearAuthProviderBase implements IAuthenticationProvider {
    public constructor(private readonly token: string) {
        super();
    }

    public initializeClient(client: any): void {
        if (this.token) {
            client.xhr.ajaxSetup({
                beforeSend: (xhr: any, url: string) => {
                    if (url.includes("/gdc/account/token")) {
                        xhr.setRequestHeader("cookie", `GDCAuthSST=${this.token}`);
                    }
                },
            });
        }
    }

    public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        await this.obtainCurrentPrincipal(context);

        return this.principal!;
    }
}
