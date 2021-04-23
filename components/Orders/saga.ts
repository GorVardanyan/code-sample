import { camelizeKeys } from 'humps';
import queryString from 'query-string';
import { takeLatest, put, select } from 'redux-saga/effects';

import { Api } from 'api';
import { processRequestError } from 'modules/errors';
import { RootState } from 'types';

import { getOrdersActions } from './actions';
import { GetOrdersResponseType } from './types';

function* getOrdersSaga() {
  const { access, type } = yield select((state: RootState) => state.login);

  try {
    let responseData;
    if (type === 'CUSTOMER') {
      const { data } = yield Api.getCustomerOrders(access);
      responseData = data;
    } else {
      const { data } = yield Api.getBusinessOrders(access);
      responseData = data;
    }

    yield put(
      getOrdersActions.success((camelizeKeys(responseData) as unknown) as GetOrdersResponseType),
    );
  } catch (error) {
    yield put(processRequestError({ error, failAction: getOrdersActions.fail }));
  }
}

function* getMoreOrdersSaga() {
  const { access, type } = yield select((state: RootState) => state.login);
  const { next } = yield select((state: RootState) => state.orders);

  const nextPage = queryString.parseUrl(next).query.page;

  try {
    let responseData;
    if (type === 'CUSTOMER') {
      const { data } = yield Api.getCustomerOrders(access, Number(nextPage));
      responseData = data;
    } else {
      const { data } = yield Api.getBusinessOrders(access, Number(nextPage));
      responseData = data;
    }

    yield put(
      getOrdersActions.fetchMoreSuccess(
        (camelizeKeys(responseData) as unknown) as GetOrdersResponseType,
      ),
    );
  } catch (error) {
    yield put(processRequestError({ error, failAction: getOrdersActions.fetchMoreFail }));
  }
}

export function* watchOrders() {
  yield takeLatest(getOrdersActions.request, getOrdersSaga);
  yield takeLatest(getOrdersActions.fetchMoreRequest, getMoreOrdersSaga);
}
