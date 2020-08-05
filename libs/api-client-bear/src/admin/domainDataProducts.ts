// (C) 2007-2020 GoodData Corporation
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    interpolate,
    parse,
    CONTRACT_DATA_PRODUCT_DOMAIN_DATA_PRODUCT,
    CONTRACT_DATA_PRODUCT_DOMAIN_DATA_PRODUCTS,
} from "./routes";
import { XhrModule } from "../xhr";

export const transformDomainDataProduct = ({ domainDataProduct }: any) => {
    const { contractId, domainId, dataProductId }: any = parse(
        domainDataProduct.links.self,
        CONTRACT_DATA_PRODUCT_DOMAIN_DATA_PRODUCT,
    );

    return {
        contractId,
        domainId,
        dataProductId,
        ...domainDataProduct,
    };
};

export class DomainDataProductModule {
    constructor(private xhr: XhrModule) {}

    public getDomainDataProducts(contractId: string, dataProductId: string) {
        return this.xhr
            .get(interpolate(CONTRACT_DATA_PRODUCT_DOMAIN_DATA_PRODUCTS, { contractId, dataProductId }))
            .then((result: any) => {
                const {
                    domainDataProducts: { items },
                    status,
                }: any = result.getData();
                return {
                    items: items.map(transformDomainDataProduct),
                    status,
                };
            });
    }
}
