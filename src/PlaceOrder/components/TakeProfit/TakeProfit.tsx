import React from "react";
import { observer } from "mobx-react";
import block from "bem-cn-lite";
import { AddCircle } from "@material-ui/icons";
import { Switch, TextButton } from "components";
import { useStore } from "PlaceOrder/context";
import { MAX_TAKE_PROFIT_ORDERS, QUOTE_CURRENCY } from "../../constants";
import { OrderSide, TTakeProfitOrder } from "../../model";
import "./TakeProfit.scss";
import { TakeProfitOrderRow } from "./components";

type Props = {
  orderSide: OrderSide;
};

const b = block("take-profit");

const TakeProfit = observer(({ orderSide }: Props) => {
  const {
    changeTakeProfitOrder,
    deleteTakeProfitOrder,
    takeProfitOrders,
    toggleIsTakeProfitActive,
    addTakeProfitOrder,
    isTakeProfitActive,
    handleBlurTakeProfitField,
    projectedProfit,
  } = useStore();

  const onFieldChange = React.useCallback((
    id: string,
    changedField: keyof Omit<TTakeProfitOrder, "id">,
    newValue: number,
  ) => {
    changeTakeProfitOrder(id, changedField, newValue);
  }, [changeTakeProfitOrder]);

  const onRowDelete = React.useCallback((id: string) => {
    deleteTakeProfitOrder(id);
  }, [deleteTakeProfitOrder]);

  const onFieldBlur = React.useCallback((
    id: string,
    changedField: keyof Pick<TTakeProfitOrder, "profit" | "targetPrice">,
  ) => {
    handleBlurTakeProfitField(id, changedField);
  }, [handleBlurTakeProfitField])

  const shouldAddOrderButtonShow = takeProfitOrders.length !== MAX_TAKE_PROFIT_ORDERS && isTakeProfitActive;

  return (
    <div className={b()}>
      <div className={b("switch")}>
        <span>Take profit</span>
        <Switch
          checked={isTakeProfitActive}
          onChange={toggleIsTakeProfitActive}
        />
      </div>
      {
        takeProfitOrders.length ? (
          <div className={b("content")}>
            <div className={b("titles")}>
              <span>Profit</span>
              <span>Target price</span>
              <span>Amount to {orderSide === "buy" ? "sell" : "buy"}</span>
            </div>
            {
              takeProfitOrders.map((order) => (
                <TakeProfitOrderRow
                  key={order.id}
                  id={order.id}
                  amount={order.amount}
                  profit={order.profit}
                  targetPrice={order.targetPrice}
                  errors={order.errors}
                  onFieldChange={onFieldChange}
                  onRowDelete={onRowDelete}
                  onFieldBlur={onFieldBlur}
                />
              ))
            }
            {
              shouldAddOrderButtonShow && (
                <TextButton
                  className={b("add-button")}
                  onClick={() => addTakeProfitOrder()}
                >
                  <AddCircle className={b("add-icon")} />
                  <span>
                    {`Add profit target ${takeProfitOrders.length}/${MAX_TAKE_PROFIT_ORDERS}`}
                  </span>
                </TextButton>
              )
            }
            <div className={b("projected-profit")}>
              <span className={b("projected-profit-title")}>Projected profit</span>
              <span className={b("projected-profit-value")}>
                <span>
                  {
                    projectedProfit
                  }
                </span>
                <span className={b("projected-profit-currency")}>
                  {QUOTE_CURRENCY}
                </span>
              </span>
            </div>
          </div>
        ) : null
      }
    </div>
  );
});

export { TakeProfit };
