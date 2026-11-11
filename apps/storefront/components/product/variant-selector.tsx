"use client";

type VariantOption = {
  id: string;
  option_name: string;
  option_value: string;
};

type ProductVariant = {
  id: string;
  sku: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  variant_options: VariantOption[];
};

type VariantSelectorProps = {
  variants: ProductVariant[];

  selectedOptions: Record<
    string,
    string
  >;

  onOptionChange: (
    optionName: string,
    optionValue: string
  ) => void;
};

export function VariantSelector({
  variants,
  selectedOptions,
  onOptionChange,
}: VariantSelectorProps) {
  const groupedOptions = new Map<
    string,
    Set<string>
  >();

  for (const variant of variants) {
    for (const option of variant.variant_options) {
      if (
        !groupedOptions.has(
          option.option_name
        )
      ) {
        groupedOptions.set(
          option.option_name,
          new Set()
        );
      }

      groupedOptions
        .get(option.option_name)!
        .add(option.option_value);
    }
  }

  // A value is pickable as long as some variant has it at all — even if
  // that variant differs from the buyer's other current picks.
  // onOptionChange (in product-detail.tsx) resolves every click to that
  // variant's full set of options, so clicking a value that conflicts
  // with another axis snaps the other axis to match instead of leaving
  // it stuck on an unreachable combination.
  function isValueAvailable(
    optionName: string,
    value: string
  ) {
    return variants.some((variant) =>
      variant.variant_options.some(
        (option) =>
          option.option_name === optionName &&
          option.option_value === value
      )
    );
  }

  return (
    <div className="space-y-4">
      {[...groupedOptions.entries()].map(
        ([optionName, values]) => (
          <div key={optionName}>
            <h3 className="mb-2 text-sm font-medium">
              {optionName}
            </h3>

            <div className="flex flex-wrap gap-2">
              {[...values].map((value) => {
                const isSelected =
                  selectedOptions[
                    optionName
                  ] === value;

                const isAvailable =
                  isValueAvailable(
                    optionName,
                    value
                  );

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() =>
                      onOptionChange(
                        optionName,
                        value
                      )
                    }
                    className={
                      !isAvailable
                        ? "cursor-not-allowed rounded-md border px-3 py-2 text-sm text-muted-foreground opacity-40"
                        : isSelected
                        ? "rounded-md border border-primary bg-muted px-3 py-2 text-sm font-medium"
                        : "rounded-md border px-3 py-2 text-sm hover:bg-muted"
                    }
                  >
                    {isSelected
                      ? `${value} ✓`
                      : value}
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}