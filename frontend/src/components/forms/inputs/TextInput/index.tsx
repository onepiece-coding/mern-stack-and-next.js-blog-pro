import { Label, TextInput as FlowbiteTextInput } from "flowbite-react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface TextInputProps<TFieldValue extends FieldValues> {
  label: string;
  type?: string;
  register?: UseFormRegister<TFieldValue>;
  name: Path<TFieldValue> | string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
}

const TextInput = <TFieldValue extends FieldValues>({
  label,
  type = "text",
  name,
  register,
  defaultValue,
  error,
  required = false,
}: TextInputProps<TFieldValue>) => {
  const inputId = `input-${name}`;

  return (
    <div>
      <div className="mb-2 block">
        <Label
          htmlFor={inputId}
          color={error && "failure"}
          value={`${label} ${required ? "*" : ""}`}
        />
      </div>
      {register ? (
        <FlowbiteTextInput
          type={type}
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
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
      ) : (
        <FlowbiteTextInput
          type={type}
          id={inputId}
          name={name}
          defaultValue={defaultValue}
          color={error && "failure"}
          helperText={
            error ? (
              <>
                <span className="font-medium">Oops!</span> {error}
              </>
            ) : null
          }
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
      )}
    </div>
  );
};

export default TextInput;
