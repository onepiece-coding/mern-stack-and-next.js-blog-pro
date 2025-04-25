import { Label, Textarea } from "flowbite-react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface TextareaInputProps<TFieldValue extends FieldValues> {
  label: string;
  register?: UseFormRegister<TFieldValue>;
  name: Path<TFieldValue> | string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
}

const TextareaInput = <TFieldValue extends FieldValues>({
  label,
  name,
  register,
  defaultValue,
  error,
  required = false,
}: TextareaInputProps<TFieldValue>) => {
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
        <Textarea
          id={inputId}
          rows={4}
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
        <Textarea
          id={inputId}
          rows={4}
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
        />
      )}
    </div>
  );
};

export default TextareaInput;
