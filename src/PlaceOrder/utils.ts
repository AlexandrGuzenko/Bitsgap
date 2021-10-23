import { v4 } from 'uuid';
import { AMOUNT_TO_SELL_DEFAULT, PROFIT_GAP } from "./constants";
import { OrderSide, TTakeProfitOrder } from "./model";

export const validateTakeProfitOrders = (
  currentOrders: TTakeProfitOrder[],
) => {
  let totalAmount = 0;
  let totalProfit = currentOrders.reduce((acc, order) => {
    totalAmount += order.amount;
    return acc + order.profit;
  }, 0);

  return currentOrders.map((order, index) => {
    const errorObj: TTakeProfitOrder['errors'] = {};
    if (totalProfit > 500) {
      errorObj.profit = 'Maximum profit sum is 500%';
    }
    if (totalAmount > 100) {
      errorObj.amount = `${totalAmount} out of 100% selected. Please decrease by ${(100 - totalAmount) * -1}`;
    }
    if (index && currentOrders[index - 1].profit >= order.profit) {
      errorObj.profit = "Each target's profit should be greater than the previous one";
    }
    if (order.profit < 0.01) {
      errorObj.profit = 'Minimum value is 0.01';
    }
    if (order.targetPrice <= 0) {
      errorObj.targetPrice = 'Price must be greater than 0';
    }
    return {
      ...order,
      errors: errorObj,
    };
  })
}

export const calculateProjectedProfit = (
  currentOrders: TTakeProfitOrder[],
  activeOrderSide: OrderSide,
  price: number,
) => currentOrders.reduce((acc, order) => {
  return acc + (activeOrderSide === 'buy'
    ? order.amount * (order.targetPrice - price) / 100
    : order.amount * (price - order.targetPrice) / 100);
}, 0)

export const onTakeProfitOrderFieldBlur = (
  currentOrders: TTakeProfitOrder[],
  choosenOrderId: string,
  changedField: keyof Pick<TTakeProfitOrder, "profit" | "targetPrice">,
  price: number,
) => currentOrders.map((order) => {
  if (order.id !== choosenOrderId) {
    return {
      ...order,
      errors: undefined,
    };
  }
  switch (changedField) {
    case 'profit':
      return {
        ...order,
        targetPrice: price + price * (order.profit / 100),
        errors: undefined,
      };
    case 'targetPrice':
      return {
        ...order,
        profit: (order.targetPrice - price) / (price || 1) * 100,
        errors: undefined,
      };
    default:
      return {
        ...order,
        errors: undefined,
      };
  }
})

/**
 * Актуализирует значения targetPrice в массиве ордеров take profit 
 */
export const recalculateTakeProfitOrders = (
  currentOrders: TTakeProfitOrder[],
  price: number,
) => currentOrders.map((order) => ({
  ...order,
  targetPrice: price + price * (order.profit / 100),
}));

/**
 * Возвращает новый массив takeProfit с еще одним добавленным ордером
 */
export const addTakeProfitOrder = (
  currentOrders: TTakeProfitOrder[],
  price: number,
): TTakeProfitOrder[] => {
  if (!currentOrders.length) {
    return [
      {
        id: v4(),
        amount: 100,
        profit: PROFIT_GAP,
        targetPrice: price + price * (PROFIT_GAP / 100),
      },
    ];
  }
  let maxAmount = 0;

  let totalAmount = currentOrders.reduce((acc, order) => {
    maxAmount = order.amount > maxAmount ? order.amount : maxAmount;
    return acc + order.amount;
  }, 0);

  const lastCurrentOrder = currentOrders[currentOrders.length - 1];

  const result = currentOrders.map((order) => {
    if (totalAmount > 100 - AMOUNT_TO_SELL_DEFAULT && order.amount === maxAmount) {
      return {
        ...order,
        amount: order.amount - AMOUNT_TO_SELL_DEFAULT - (totalAmount - 100),
      };
    }
    return order;
  })

  result.push({
    id: v4(),
    amount: AMOUNT_TO_SELL_DEFAULT,
    profit: lastCurrentOrder.profit + PROFIT_GAP,
    targetPrice: price + price * ((lastCurrentOrder.profit + PROFIT_GAP) / 100),
  });

  return result;
}
