import { createReducer } from 'deox';
import produce from 'immer';

import { logoutAction } from 'modules/login/actions';

import { getOrdersActions } from './actions';
import { OrdersState } from './types';

const initialState: OrdersState = {
  loading: false,
  fetchMoreLoading: false,
  error: null,
  count: 0,
  next: null,
  previous: null,
  results: [],
};

export const ordersReducer = createReducer(initialState, handle => [
  handle(getOrdersActions.request, state =>
    produce(state, draft => {
      draft.loading = true;
      draft.error = null;
    }),
  ),
  handle(getOrdersActions.success, (state, { payload }) => ({
    ...state,
    ...payload,
    loading: false,
    error: null,
  })),
  handle(getOrdersActions.fail, (state, { payload }) =>
    produce(state, draft => {
      draft.loading = false;
      draft.error = payload;
    }),
  ),
  handle(getOrdersActions.fetchMoreRequest, state =>
    produce(state, draft => {
      draft.fetchMoreLoading = true;
      draft.error = null;
    }),
  ),
  handle(getOrdersActions.fetchMoreSuccess, (state, { payload }) => ({
    ...state,
    ...payload,
    fetchMoreLoading: false,
    results: [...state.results, ...payload.results],
  })),
  handle(getOrdersActions.fetchMoreFail, (state, { payload }) =>
    produce(state, draft => {
      draft.fetchMoreLoading = false;
      draft.error = payload;
    }),
  ),
  handle(logoutAction, () => initialState),
]);
