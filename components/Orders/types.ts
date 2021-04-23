import { StateType } from 'modules/common/types';
import { ResponseError } from 'modules/errors';
import { CustomerUserType } from 'modules/user/types';

export type OrderType = {
  date: string;
  details?: {
    address: string;
    deliveryInfo: string | null;
    email: string;
    id: number;
    firstName: string;
    lastName: string;
    postcode: string;
    state: StateType;
  };
  id: number;
  orderProduct: {
    qty: number;
    sumPrice: string;
    product: {
      id: number;
      image: string | null;
      name: string;
      price: string;
      size: number;
      business: {
        name: string;
      };
    };
  }[];
  status: string;
  deliveryPrice?: string;
  totalProductPrice?: string;
  totalPrice?: string;
  orderTotalProductPrice?: string;
  orderTotalPrice?: string;
  customer?: CustomerUserType;
  guest?: {
    address: string;
    deliveryInfo: string | null;
    email: string;
    id: number;
    firstName: string;
    lastName: string;
    postcode: string;
    state: StateType;
  };
};

export type GetOrdersResponseType = {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderType[];
};

export type OrdersState = GetOrdersResponseType & {
  loading: boolean;
  fetchMoreLoading: boolean;
  error: ResponseError | null;
};
