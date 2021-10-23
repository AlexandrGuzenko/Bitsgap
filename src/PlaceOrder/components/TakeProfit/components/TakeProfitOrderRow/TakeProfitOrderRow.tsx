import { Cancel } from "@material-ui/icons";
import React from "react";
import block from "bem-cn-lite";
import { NumberInput } from "components";
import { QUOTE_CURRENCY } from "PlaceOrder/constants";
import { TTakeProfitOrder } from "PlaceOrder/model";
import "./TakeProfitOrderRow.scss";

const b = block("take-profit-row");

type Props = TTakeProfitOrder & {
  onFieldChange: (
    id: string,
    changedField: keyof Omit<TTakeProfitOrder, "id">,
    newValue: number,
  ) => void;
  onRowDelete: (id: string) => void;
  onFieldBlur: (
    id: string,
    changedField: keyof Pick<TTakeProfitOrder, "profit" | "targetPrice">,
  ) => void;
}

// Это глупый компонент, он ничего не должен знать о бизнес-логике.
// Поэтому работу со стором он не из MobX берет, а из пропсов.
export const TakeProfitOrderRow = React.memo<Props>(({
  id,
  amount,
  profit,
  targetPrice,
  onFieldChange,
  onRowDelete,
  onFieldBlur,
  errors,
}) => {
  const handleFieldChange = (fieldName: keyof Omit<TTakeProfitOrder, "id">) => (newValue: number | null) => {
    onFieldChange(id, fieldName, newValue ?? 0);
  };

  return (
    <div className={b()}>
      <NumberInput
        value={profit}
        onChange={handleFieldChange("profit")}
        onBlur={() => onFieldBlur(id, "profit")}
        decimalScale={2}
        InputProps={{ endAdornment: "%" }}
        variant="underlined"
        error={errors?.profit}
      />
      <NumberInput
        value={targetPrice}
        onChange={handleFieldChange("targetPrice")}
        onBlur={() => onFieldBlur(id, "targetPrice")}
        decimalScale={2}
        InputProps={{ endAdornment: QUOTE_CURRENCY }}
        variant="underlined"
        error={errors?.targetPrice}
      />
      <NumberInput
        value={amount}
        onChange={handleFieldChange("amount")}
        decimalScale={2}
        InputProps={{ endAdornment: "%" }}
        variant="underlined"
        error={errors?.amount}
      />
      <div
        className={b("cancel-icon")}
        onClick={() => onRowDelete(id)}
      >
        <Cancel />
      </div>
    </div>
  )
});
