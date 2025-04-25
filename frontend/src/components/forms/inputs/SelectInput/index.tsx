import { Label, Select } from "flowbite-react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

// Generic option type that can be used for any select input
export type TOption<T = string | number> = {
  key: string;
  value: T;
};

interface SelectInputProps<TFieldValue extends FieldValues> {
  label: string;
  register: UseFormRegister<TFieldValue>;
  name: Path<TFieldValue>;
  defaultValue: string;
  error?: string;
  options: TOption[];
  placeholder?: string;
  required?: boolean;
}

const SelectInput = <TFieldValue extends FieldValues>({
  label,
  register,
  name,
  defaultValue,
  options,
  placeholder = "Select an option",
  error,
  required = false,
}: SelectInputProps<TFieldValue>) => {
  const inputId = `input-${name}`;

  return (
    <div>
      <div className="mb-2 block">
        <Label
          htmlFor={name}
          color={error && "failure"}
          value={`${label} ${required ? "*" : ""}`}
        />
      </div>
      <Select
        id={inputId}
        {...register(name as Path<TFieldValue>)}
        defaultValue={defaultValue}
        color={error && "failure"}
        helperText={
          error ? (
            <>
              <span className="font-medium">Oops!</span> {error}
            </>
          ) : null
        }
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.key} value={option.value} className="capitalize">
            {option.value}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default SelectInput;
