// (C) 2007-2020 GoodData Corporation
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    interpolate,
    parse,
    CONTRACT_DATA_PRODUCT,
    CONTRACT_DATA_PRODUCTS,
    CONTRACT_DOMAIN,
    CONTRACT_DATA_PRODUCT_RENAME,
} from "./routes";
import { transformSegment } from "./segments";
import * as domainDataProducts from "./domainDataProducts";
import { XhrModule, ApiResponse } from "../xhr";

export const transformDataProduct = (item: any) => {
    const { contractId }: any = parse(item.dataProduct.links.self, CONTRACT_DATA_PRODUCT);

    const dataProduct = {
        contractId,
        ...item.dataProduct,
    };

    if (dataProduct.domainDataProducts) {
        dataProduct.domainDataProducts = dataProduct.domainDataProducts.map(
            domainDataProducts.transformDomainDataProduct,
        );
    }
    if (dataProduct.segments) {
        dataProduct.segments = dataProduct.segments.map(transformSegment);
    }

    return dataProduct;
};

export class DataProductsModule {
    constructor(private xhr: XhrModule) {}

    public getDataProducts(contractId: string, include: any) {
        return this.xhr
            .get(interpolate(CONTRACT_DATA_PRODUCTS, { contractId }, include && { include }))
            .then((r: any) => r.getData())
            .then((data: any) => ({
                items: data.dataProducts.items.map(transformDataProduct),
            }));
    }

    public getDataProduct(contractId: string, dataProductId: string, include: any, stats: any, state: any) {
        return this.xhr
            .get(
                interpolate(
                    CONTRACT_DATA_PRODUCT,
                    { contractId, dataProductId },
                    {
                        ...(include && { include }),
                        ...(stats && { stats }),
                        ...(state && { state }),
                    },
                ),
            )
            .then((r: any) => r.getData())
            .then((data: any) => transformDataProduct(data));
    }

    public createDataProduct(
        contractId: string,
        dataProductId: string,
        domainIds: string[],
    ): Promise<ApiResponse> {
        return this.xhr.post(interpolate(CONTRACT_DATA_PRODUCTS, { contractId }), {
            body: JSON.stringify({
                dataProductCreate: {
                    id: dataProductId,
                    domains: domainIds.map((domainId) =>
                        interpolate(CONTRACT_DOMAIN, { contractId, domainId }),
                    ),
                },
            }),
        });
    }

    public renameDataProduct(
        contractId: string,
        dataProductId: string,
        newDataProductId: string,
    ): Promise<ApiResponse> {
        return this.xhr.post(interpolate(CONTRACT_DATA_PRODUCT_RENAME, { contractId, dataProductId }), {
            body: JSON.stringify({ dataProductRename: { id: newDataProductId } }),
        });
    }

    public deleteDataProduct(contractId: string, dataProductId: string): Promise<ApiResponse> {
        return this.xhr.del(interpolate(CONTRACT_DATA_PRODUCT, { contractId, dataProductId }));
    }
}
