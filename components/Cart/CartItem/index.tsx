import React from 'react';

import deleteImage from 'assets/images/delete.svg';

import { NoImagePlaceholder } from 'components/Icons/NoImage';
import { CardButtons } from 'components/Product/CardButton';
import { cartActions } from 'modules/user/actions';
import { Cart } from 'modules/user/types';

import { useAction } from 'utils/hooks';

import styles from './index.module.scss';

type Props = {
  cartItem: Cart[0];
};

export const CartItem = ({ cartItem }: Props) => {
  const removeCartItem = useAction(cartActions.removeProductRequest);

  const onRemove = (): void => {
    removeCartItem(cartItem);
  };

  return (
    <div className={styles.cart_item}>
      <div>
        <div className={styles.photo_wrapper}>
          {cartItem.product.image ? (
            <img
              src={cartItem.product.image}
              alt={`Finestro-${cartItem.product.name}`}
              className={styles.product_photo}
            />
          ) : (
            <NoImagePlaceholder className={styles.product_photo} color="#ececec" />
          )}
        </div>
        <div className={styles.product_info_wrapper}>
          <h4>{cartItem.product.name}</h4>
          <div>
            <p>{cartItem.product.size}ml</p>
            <span />
            <p>{cartItem.product.business.name}</p>
          </div>
        </div>
      </div>
      <div className={styles.count_wrapper}>
        <div>
          <CardButtons
            item={cartItem.product}
            externalProdCount={cartItem.count}
            useExistingMode
            errorMessageClassName={styles.count_error}
            className={styles.card_buttons}
          />
        </div>
        <h4>${Number(+cartItem.product.price * cartItem.count).toFixed(2)}</h4>
      </div>
      <span onClick={onRemove}>
        <img src={deleteImage} alt="Remove" title="Remove from cart" />
      </span>
    </div>
  );
};
