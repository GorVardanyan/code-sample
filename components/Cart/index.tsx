import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { Api } from 'api';

import applePayImage from 'assets/images/PaymentMethods/ApplePay.png';
import googleImage from 'assets/images/PaymentMethods/GooglePay/Google.png';
import googlePayImage from 'assets/images/PaymentMethods/GooglePay/Pay.png';

import { AccentButton } from 'components/Buttons/AccentButton';
import { CardCheckoutDialog } from 'components/CardCheckoutDialog';
import {
  DeliveryInfoForm,
  DetailsFormValues,
  ShippingFormValues,
} from 'components/DeliveryInfoForm';
import { FormInput } from 'components/Forms';
import { GoBack } from 'components/GoBack';
import { Title } from 'components/Title';

import { cartActions } from 'modules/user/actions';
import { Cart as CartType } from 'modules/user/types';

import { RootState } from 'types/rootState';
import { useAction } from 'utils/hooks';

import { CartItem } from './CartItem';

import styles from './index.module.scss';

const Cart = () => {
  const user = useSelector((state: RootState) => state.user);
  const getCart = useAction(cartActions.getRequest);
  const emptyCart = useAction(cartActions.emptyInLocal);
  const deliveryInfoFormRef = useRef<React.ElementRef<typeof DeliveryInfoForm>>(null);
  const [cardCheckoutDialogShown, setCardCheckoutDialogShown] = useState(false);
  const [detailsFormValues, setDetailsFormValues] = useState<DetailsFormValues>();
  const [shippingFormValues, setShippingFormValues] = useState<ShippingFormValues>();
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const verifyPromoCodeRequest = useAction(cartActions.verifyPromoCodeRequest);
  const verifyPromoCodeReset = useAction(cartActions.verifyPromoCodeReset);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState<string | undefined>(undefined);

  useEffect(() => {
    getCart();

    return () => {
      verifyPromoCodeReset();
    };
  }, []);

  useEffect(() => {
    (async () => {
      let totalProductsCount = 0;
      user.cart?.forEach(cartItem => {
        totalProductsCount += cartItem.count;
      });
      const { data } = await Api.calculateDeliveryPrice(totalProductsCount);
      setDeliveryPrice(data.delivery_price);
    })();
  }, [user.cart]);

  const productsTotalPrice = useMemo(() => {
    let totalPrice = 0;
    user.cart?.forEach(cartItem => {
      totalPrice += +cartItem.product.price * cartItem.count;
    });

    if (user.promoCode) {
      totalPrice -= (totalPrice * user.promoCode.percentageOff) / 100;
    }

    return totalPrice;
  }, [user.cart, user.promoCode]);

  const onDeliveryInfoSubmit = (values: DetailsFormValues) => {
    setDetailsFormValues(values);
    deliveryInfoFormRef.current?.submitShippingForm();
  };

  const onShippingInfoSubmit = (values: ShippingFormValues | null) => {
    if (values) {
      setShippingFormValues(values);
    } else {
      setShippingFormValues(detailsFormValues);
    }
    setCardCheckoutDialogShown(true);
  };

  const handlePayWithCard = () => {
    deliveryInfoFormRef.current?.submitDetailsForm();
  };

  const onCheckoutSuccess = () => {
    emptyCart();
    setCardCheckoutDialogShown(false);
  };

  const handlePromoCodeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPromoCode(event.target.value);
    if (event.target.value.length > 20) {
      if (!promoCodeError) {
        setPromoCodeError('Promo-code is too long!');
      }
    } else if (promoCodeError) {
      setPromoCodeError(undefined);
    }
  };

  const verifyPromoCode = async () => {
    if (promoCode) {
      verifyPromoCodeRequest({ promoCode });
    } else {
      verifyPromoCodeReset();
    }
  };

  const calculatedTotalTotalPrice = useMemo(() => {
    const totalPrice = productsTotalPrice + deliveryPrice;

    return totalPrice.toFixed(2);
  }, [productsTotalPrice, deliveryPrice]);

  return (
    <div className={styles.cart_page_container}>
      <GoBack goBackPath="/explore" description="Continue shopping" className={styles.go_back} />
      {user.cartError && (
        <p className={`${styles.message} ${styles.error_message}`}>{user.cartError}</p>
      )}
      {user.cart?.length === 0 ? (
        <p className={styles.message}>Your cart is empty</p>
      ) : (
        <div className={styles.cart_container}>
          <div className={styles.first_column}>
            <Title text="Cart" />
            <div className={styles.cart_items}>
              {user.cart?.map((cartItem, index, array) => {
                return (
                  <React.Fragment key={cartItem.product.id}>
                    <CartItem cartItem={cartItem} />
                    {index < array.length - 1 && <div className={styles.horizontal_separator} />}
                  </React.Fragment>
                );
              })}
            </div>
            <h2 className={styles.details_heading}>Your details</h2>
            <DeliveryInfoForm
              showCheckboxes
              ref={deliveryInfoFormRef}
              onDetailsSubmit={onDeliveryInfoSubmit}
              onShippingSubmit={onShippingInfoSubmit}
            />
          </div>
          <div className={styles.vertical_separator} />
          <div className={styles.second_column}>
            <h2>Check out</h2>
            <div className={styles.checkout_summary}>
              <p>Products total</p>
              <span>${productsTotalPrice.toFixed(2)}</span>
            </div>
            <div className={styles.checkout_summary}>
              <p>Delivery</p>
              <span>${deliveryPrice.toFixed(2)}</span>
            </div>
            <div className={styles.promo_code_wrapper}>
              <FormInput
                id="promo-code"
                placeholder="Enter promo-code"
                className={styles.promo_code_input}
                value={promoCode}
                onChange={handlePromoCodeChange}
                error={promoCodeError || user.promoCodeError || undefined}
              />
              <AccentButton
                className={styles.accent_button_wrapper}
                onClick={verifyPromoCode}
                loading={user.promoCodeLoading || undefined}
              >
                Apply
              </AccentButton>
            </div>
            <div className={styles.horizontal_separator} />
            <div className={`${styles.checkout_summary} ${styles.checkout_summary_total}`}>
              <p>Total</p>
              <span>${calculatedTotalTotalPrice}</span>
            </div>
            <AccentButton className={styles.pay_with_card_button} onClick={handlePayWithCard}>
              Pay with card
            </AccentButton>
            <div className={styles.buttons_wrapper}>
              <AccentButton className={styles.apple_google_button}>
                <img src={googleImage} alt="Google" />
                <img src={googlePayImage} alt="Google pay" />
              </AccentButton>
              <AccentButton className={styles.apple_google_button}>
                <img src={applePayImage} alt="Apple pay" />
              </AccentButton>
            </div>
          </div>
          <CardCheckoutDialog
            isOpen={cardCheckoutDialogShown}
            onClose={() => setCardCheckoutDialogShown(false)}
            detailsFormValues={detailsFormValues as DetailsFormValues}
            shippingFormValues={shippingFormValues as ShippingFormValues}
            cart={user.cart as CartType}
            actInSuccessState={onCheckoutSuccess}
          />
        </div>
      )}
    </div>
  );
};

export default Cart;
