import React, { useState } from 'react';

import { Api } from 'api';

import { NoImagePlaceholder } from 'components/Icons/NoImage';
import { Modal } from 'components/Modal';

import { OrderType } from 'modules/orders/types';

import { formatDateString } from 'utils/helpers';

import styles from './index.module.scss';

type OrderDetailsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  order: OrderType;
  isBusiness: boolean;
};

const modalOverlayStyle = {
  alignItems: 'center',
};

const modalContentStyle = {
  minWidth: '630px',
};

export const OrderDetailsDialog = ({
  isOpen,
  onClose,
  order,
  isBusiness,
}: OrderDetailsDialogProps) => {
  const [calculatedDeliveryPrice, setCalculatedDeliveryPrice] = useState<null | string>(null);
  const getDeliveryAddress = () => {
    const correctKey = order.details ? 'details' : 'guest';
    return `${order[correctKey]?.deliveryInfo ? `${order[correctKey]?.deliveryInfo}, ` : ''}
      ${order[correctKey]?.address}, ${order[correctKey]?.state.name},
      ${order[correctKey]?.postcode}
    `;
  };

  const getCustomerName = () => {
    const correctKey = order.details ? 'details' : 'guest';
    return `${order[correctKey]?.firstName} ${order[correctKey]?.lastName}`;
  };

  const getCustomerEmail = () => {
    const correctKey = order.details ? 'details' : 'guest';
    return order[correctKey]?.email;
  };

  const getProductsTotalPrice = () => {
    const productTotalPrice = order.orderTotalProductPrice || order.totalProductPrice;

    if (productTotalPrice) {
      return productTotalPrice;
    }

    return order.orderProduct
      .reduce((totalPrice, orderProduct) => totalPrice + Number(orderProduct.sumPrice), 0)
      .toFixed(2);
  };

  const getDeliveryPrice = () => {
    if (order.deliveryPrice) {
      return order.deliveryPrice;
    }

    if (order.totalPrice) {
      const deliveryPrice = +order.totalPrice - +getProductsTotalPrice();
      return deliveryPrice.toFixed(2);
    }

    const totalProductsCount = order.orderProduct.reduce(
      (totalCount, orderProduct) => totalCount + orderProduct.qty,
      0,
    );

    Api.calculateDeliveryPrice(totalProductsCount).then(response =>
      setCalculatedDeliveryPrice(response.data.delivery_price.toFixed(2)),
    );

    return null;
  };

  const getTotalPrice = () => {
    return order.orderTotalPrice || order.totalPrice;
  };

  return (
    <Modal
      isOpen={isOpen}
      hasTitle
      title="Order details"
      onClose={onClose}
      overlayStyle={modalOverlayStyle}
      contentStyle={modalContentStyle}
      popupContentClassName={styles.popup_content}
      closeButtonClassName={styles.close_dialog_button}
    >
      <div className={styles.order_products_wrapper}>
        {order.orderProduct.map((orderProduct, index, array) => (
          <React.Fragment key={orderProduct.product.id}>
            <div className={styles.order_product}>
              <div>
                <div className={styles.photo_wrapper}>
                  {orderProduct.product.image ? (
                    <img
                      src={orderProduct.product.image}
                      alt={`Finestro-${orderProduct.product.name}`}
                      className={styles.product_photo}
                    />
                  ) : (
                    <NoImagePlaceholder className={styles.product_photo} color="#ececec" />
                  )}
                </div>
                <div className={styles.product_info_wrapper}>
                  <h4>{orderProduct.product.name}</h4>
                  <div>
                    <p>{orderProduct.product.size}ml</p>
                    <span />
                    <p>{orderProduct.product.business.name}</p>
                  </div>
                </div>
              </div>
              <div className={styles.price_wrapper}>
                <h4>${orderProduct.sumPrice}</h4>
              </div>
            </div>
            {index < array.length - 1 && <div className={styles.horizontal_separator} />}
          </React.Fragment>
        ))}
      </div>
      <div className={styles.detail_wrapper}>
        <span>Delivery address</span>
        <p>{getDeliveryAddress()}</p>
      </div>
      <div className={styles.detail_wrapper}>
        <span>Date</span>
        <p>{formatDateString(order.date)}</p>
      </div>
      {isBusiness && (
        <div className={styles.detail_wrapper}>
          <span>Customer</span>
          <p>{getCustomerName()}</p>
        </div>
      )}
      {isBusiness && (
        <div className={styles.detail_wrapper}>
          <span>Email</span>
          <p>{getCustomerEmail()}</p>
        </div>
      )}
      <div className={`${styles.horizontal_separator} ${styles.horizontal_separator_second}`} />
      <div className={`${styles.detail_wrapper} ${styles.wrap_up}`}>
        <span>Products total</span>
        <p>${getProductsTotalPrice()}</p>
      </div>
      <div className={`${styles.detail_wrapper} ${styles.wrap_up}`}>
        <span>Delivery</span>
        <p>${calculatedDeliveryPrice || getDeliveryPrice()}</p>
      </div>
      <div className={`${styles.detail_wrapper} ${styles.wrap_up}`}>
        <span>Total</span>
        <p>${getTotalPrice()}</p>
      </div>
    </Modal>
  );
};
