"use client";

import { Minus, Plus } from "lucide-react";
import {
  Button,
  Group,
  Input,
  NumberField,
  type NumberFieldProps,
} from "react-aria-components";
import { cn } from "@/lib/utils";

type NumberInputProps = {
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

export default function NumberInput({
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
}: NumberInputProps) {
  return (
    <NumberField
      {...props}
      value={value}
      onChange={onChange}
      minValue={min}
      maxValue={max}
      step={step}
      isDisabled={disabled}
    >
      <Group
        className={cn(
          "relative inline-flex h-10 w-full items-center overflow-hidden whitespace-nowrap border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20",
          className,
        )}
      >
        <Button
          slot="decrement"
          className={cn(
            "-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <Minus size={16} strokeWidth={2} />
        </Button>

        <Input
          className="h-10 w-full grow bg-background px-3 py-2 text-center tabular-nums text-foreground focus:outline-none"
          id={id}
          name={name}
        />

        <Button
          slot="increment"
          className={cn(
            "-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <Plus size={16} strokeWidth={2} />
        </Button>
      </Group>
    </NumberField>
  );
}
