export type OrderSide = "buy" | "sell";

export type TTakeProfitOrder = {
  id: string;
  /**
   * Потенциальная прибыль
   */
  profit: number;
  /**
   * Целевая цена
   */
  targetPrice: number;
  /**
   * Процент позиции
   */
  amount: number;
  /**
   * Объект с ключами из TTakeProfitOrder и значениями ошибок
   */
  errors?: Partial<
    Record<keyof Omit<TTakeProfitOrder, "id" | "error">, string | null>
  >;
}
