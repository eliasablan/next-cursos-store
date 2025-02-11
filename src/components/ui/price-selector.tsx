"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Button,
  Group,
  Input,
  NumberField,
  type NumberFieldProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

type PriceSelectorProps = {
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
} & NumberFieldProps;

export default function PriceSelector({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  className,
  id,
  name,
  ...props
}: PriceSelectorProps) {
  return (
    <NumberField
      {...props}
      value={value}
      onChange={onChange}
      minValue={min}
      maxValue={max}
      step={step}
      isDisabled={disabled}
      formatOptions={{
        style: "currency",
        currency: "USD",
        currencySign: "accounting",
      }}
    >
      <Group
        className={cn(
          className,
          "relative inline-flex h-10 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20",
        )}
      >
        <Input
          className="flex-1 bg-background px-3 py-2 tabular-nums text-foreground focus:outline-none"
          id={id}
          name={name}
        />
        <div className="flex h-[calc(100%+2px)] flex-col">
          <Button
            slot="increment"
            className="-me-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronUp size={12} strokeWidth={2} aria-hidden="true" />
          </Button>
          <Button
            slot="decrement"
            className="-me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </Group>
    </NumberField>
  );
}
