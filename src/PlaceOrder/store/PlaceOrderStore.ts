import { observable, computed, action } from "mobx";
import {
  addTakeProfitOrder,
  calculateProjectedProfit,
  onTakeProfitOrderFieldBlur,
  recalculateTakeProfitOrders,
  validateTakeProfitOrders,
} from "PlaceOrder/utils";
import { OrderSide, TTakeProfitOrder } from "../model";

export class PlaceOrderStore {
  @observable activeOrderSide: OrderSide = "buy";
  @observable price: number = 0;
  @observable amount: number = 0;
  @observable isTakeProfitActive: boolean = false;
  @observable takeProfitOrders: TTakeProfitOrder[] = [];

  @computed get total(): number {
    return this.price * this.amount;
  }

  @computed get projectedProfit(): number {
    return calculateProjectedProfit(
      this.takeProfitOrders,
      this.activeOrderSide,
      this.price,
    );
  }

  @action.bound
  public setOrderSide(side: OrderSide) {
    this.activeOrderSide = side;
  }

  @action.bound
  public setPrice(price: number) {
    this.price = price;
    this.takeProfitOrders = recalculateTakeProfitOrders(this.takeProfitOrders, this.price);
  }

  @action.bound
  public setAmount(amount: number) {
    this.amount = amount;
  }

  @action.bound
  public setTotal(total: number) {
    this.amount = this.price > 0 ? total / this.price : 0;
  }

  @action.bound
  public toggleIsTakeProfitActive(isActive: boolean) {
    this.isTakeProfitActive = isActive;
    this.takeProfitOrders = isActive ? addTakeProfitOrder([], this.price) : [];
  }

  @action.bound
  public addTakeProfitOrder() {
    this.takeProfitOrders = addTakeProfitOrder(this.takeProfitOrders, this.price);
  }

  @action.bound
  public deleteTakeProfitOrder(id: string) {
    this.takeProfitOrders = this.takeProfitOrders.filter(order => order.id !== id);
  }

  @action.bound
  public validateTakeProfits() {
    this.takeProfitOrders = validateTakeProfitOrders(this.takeProfitOrders);
  }

  @action.bound
  public handleBlurTakeProfitField(
    choosenOrderId: string,
    changedField: keyof Pick<TTakeProfitOrder, "profit" | "targetPrice">,
  ) {
    this.takeProfitOrders = onTakeProfitOrderFieldBlur(
      this.takeProfitOrders,
      choosenOrderId,
      changedField,
      this.price,
    );
  }

  @action.bound
  public changeTakeProfitOrder(
    id: string,
    changedField: keyof Omit<TTakeProfitOrder, "id">,
    newValue: number,
  ) {
    this.takeProfitOrders = this.takeProfitOrders.map((order) => {
      if (order.id === id) {
        return {
          ...order,
          [changedField]: newValue,
        }
      }
      return order;
    });
  }
}
