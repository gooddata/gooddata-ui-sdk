// (C) 2007-2018 GoodData Corporation
import { Role } from 'testcafe';
import { config } from './config';
import { loginUsingGreyPages } from './helpers';

export const currentUser = Role(`${config.hostname}/gdc/account/login`, loginUsingGreyPages);
