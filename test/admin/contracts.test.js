// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import { createModule as contractsFactory } from '../../src/admin/contracts';
import { createModule as xhrFactory } from '../../src/xhr';
import { createModule as configFactory } from '../../src/config';

const config = configFactory();
const xhr = xhrFactory(config);
const contracts = contractsFactory(xhr);

describe('contracts', () => {
    describe('with fake server', () => {
        describe('getUserContracts', () => {
            const contractsPayload = JSON.stringify({
                contracts: {
                    items: [
                        {
                            contract: {
                                id: 'contractId1'
                            }
                        },
                        {
                            contract: {
                                id: 'contractId2'
                            }
                        }
                    ],
                    paging: {

                    }
                }
            });

            it('should return users contracts', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts',
                    {
                        status: 200,
                        body: contractsPayload
                    }
                );

                return contracts.getUserContracts().then((result) => {
                    expect(result.items.length).toBe(2);
                    expect(result.items[0].id).toBe('contractId1');
                    expect(result.items[1].id).toBe('contractId2');
                });
            });
        });
    });
});
