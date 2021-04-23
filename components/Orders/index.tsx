import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { ErrorMessage } from 'components/Forms/ErrorMessage';
import { Loader } from 'components/Loader';
import { Title } from 'components/Title';

import { getOrdersActions } from 'modules/orders/actions';
import { OrderType } from 'modules/orders/types';

import { RootState } from 'types/rootState';
import { formatDateString, formatOrderStatus } from 'utils/helpers';
import { useAction } from 'utils/hooks';

import styles from './index.module.scss';

import { OrderDetailsDialog } from './OrderDetailsDialog';

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [orderDetailsDialogShown, setOrderDetailsDialogShown] = useState(false);
  const orders = useSelector((state: RootState) => state.orders);
  const { type } = useSelector((state: RootState) => state.login);
  const getOrders = useAction(getOrdersActions.request);
  const fetchMoreOrders = useAction(getOrdersActions.fetchMoreRequest);

  useEffect(() => {
    getOrders();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', fetchMoreOrdersDependingOnScroll);
    return () => window.removeEventListener('scroll', fetchMoreOrdersDependingOnScroll);
  }, [orders]);

  useEffect(() => {
    if (!orders.loading && orders.results.length > 0) {
      fetchMoreOrdersDependingOnScroll();
    }
  }, [orders.loading]);

  const fetchMoreOrdersDependingOnScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.offsetHeight
    ) {
      if (!orders.fetchMoreLoading && orders.next && orders.count > orders.results.length) {
        fetchMoreOrders();
      }
    }
  };

  const handleDetailsClick = (order: OrderType) => {
    setSelectedOrder(order);
    setOrderDetailsDialogShown(true);
  };

  const onDetailsDialogClose = () => {
    setSelectedOrder(null);
    setOrderDetailsDialogShown(false);
  };

  const getTotalPrice = (order: OrderType) => {
    const correctKey = type === 'BUSINESS' ? 'orderTotalPrice' : 'totalPrice';
    return order[correctKey];
  };

  return (
    <div className={styles.orders}>
      <Title text="Orders" />
      <div className={styles.loading_error_wrapper}>
        {orders.loading && <Loader isWhite className={styles.loader} />}
        {orders.error && <ErrorMessage error={orders.error} />}
      </div>
      <table>
        <thead>
          <tr>
            <th>Order No</th>
            <th className={styles.status_heading}>Status</th>
            <th>Date</th>
            <th className={`${styles.right_aligned} ${styles.right_aligned_heading}`}>Total</th>
            <th aria-label="actions" />
          </tr>
        </thead>
        <tbody>
          {orders.results.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>
                <span
                  className={`${styles.status} ${
                    formatOrderStatus(order.status) !== 'Complete' ? styles.pending_status : ''
                  }`}
                />
                {formatOrderStatus(order.status)}
              </td>
              <td>{formatDateString(order.date)}</td>
              <td className={`${styles.right_aligned} ${styles.price}`}>${getTotalPrice(order)}</td>
              <td>
                <div className="accent_button_wrapper_">
                  <button
                    type="button"
                    className="inverted_accent_button"
                    onClick={() => handleDetailsClick(order)}
                  >
                    Details
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.loading_error_wrapper}>
        {orders.fetchMoreLoading && <Loader isWhite className={styles.loader} />}
      </div>
      {selectedOrder && (
        <OrderDetailsDialog
          isOpen={orderDetailsDialogShown}
          onClose={onDetailsDialogClose}
          order={selectedOrder as OrderType}
          isBusiness={type === 'BUSINESS'}
        />
      )}
    </div>
  );
};

export default Orders;
