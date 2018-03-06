import * as routes from './routes';

export const transformDomainDataProduct = ({ domainDataProduct }) => {
    const { contractId, domainId, dataProductId } =
        routes.parse(domainDataProduct.links.self, routes.CONTRACT_DATA_PRODUCT_DOMAIN_DATA_PRODUCT);

    return {
        contractId,
        domainId,
        dataProductId,
        ...domainDataProduct
    };
};

export function createModule(xhr) {
    const getDomainDataProducts = (contractId, dataProductId) =>
        xhr.get(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_DOMAIN_DATA_PRODUCTS, { contractId, dataProductId }))
            .then(({ domainDataProducts: { items }, status }) => ({
                items: items.map(transformDomainDataProduct),
                status
            }));

    return {
        getDomainDataProducts
    };
}
