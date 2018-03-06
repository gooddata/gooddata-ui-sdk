import { get } from '../xhr';
import * as routes from './routes';

export const getUserContracts = () => get(routes.CONTRACTS).then(data => ({
    items: data.contracts.items.map(item => item.contract),
    paging: data.contracts.paging
}));
