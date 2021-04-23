import { createAction } from 'deox';

import { ResponseError } from 'modules/errors';

import { GetOrdersResponseType } from './types';

export const getOrdersActions = {
  request: createAction('orders/GET_REQUEST'),
  success: createAction('orders/GET_SUCCESS', res => (data: GetOrdersResponseType) => res(data)),
  fail: createAction('orders/GET_FAIL', res => (err: ResponseError) => res(err)),
  fetchMoreRequest: createAction('orders/FETCH_MORE_REQUEST'),
  fetchMoreSuccess: createAction(
    'orders/FETCH_MORE_SUCCESS',
    res => (data: GetOrdersResponseType) => res(data),
  ),
  fetchMoreFail: createAction('orders/FETCH_MORE_FAIL', res => (err: ResponseError) => res(err)),
};
