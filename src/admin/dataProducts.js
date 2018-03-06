import { get, post, del } from '../xhr';
import * as routes from './routes';
import * as segments from './segments';
import * as domainDataProducts from './domainDataProducts';

export const transformDataProduct = (item) => {
    const { contractId } = routes.parse(item.dataProduct.links.self, routes.CONTRACT_DATA_PRODUCT);

    const dataProduct = {
        contractId,
        ...item.dataProduct
    };

    if (dataProduct.domainDataProducts) {
        dataProduct.domainDataProducts =
            dataProduct.domainDataProducts.map(domainDataProducts.transformDomainDataProduct);
    }
    if (dataProduct.segments) {
        dataProduct.segments = dataProduct.segments.map(segments.transformSegment);
    }

    return dataProduct;
};

export const getDataProducts = (contractId, include) =>
    get(routes.interpolate(routes.CONTRACT_DATA_PRODUCTS, { contractId }, include && { include }))
        .then(data => ({
            items: data.dataProducts.items.map(transformDataProduct)
        }));

export const getDataProduct = (contractId, dataProductId, include, stats, state) =>
    get(routes.interpolate(
            routes.CONTRACT_DATA_PRODUCT, { contractId, dataProductId },
            Object.assign(include && { include }, stats && { stats }, state && { state })
        ))
        .then(data => transformDataProduct(data));

export const createDataProduct = (contractId, dataProductId, domainIds) =>
    post(routes.interpolate(routes.CONTRACT_DATA_PRODUCTS, { contractId }), {
        data: JSON.stringify({
            dataProductCreate: {
                id: dataProductId,
                domains: domainIds.map(domainId => routes.interpolate(routes.CONTRACT_DOMAIN, { contractId, domainId }))
            }
        })
    });

export const renameDataProduct = (contractId, dataProductId, newDataProductId) =>
    post(routes.interpolate(routes.CONTRACT_DATA_PRODUCT_RENAME, { contractId, dataProductId }), {
        data: JSON.stringify({ dataProductRename: { id: newDataProductId } })
    });

export const deleteDataProduct = (contractId, dataProductId) =>
    del(routes.interpolate(routes.CONTRACT_DATA_PRODUCT, { contractId, dataProductId }));
