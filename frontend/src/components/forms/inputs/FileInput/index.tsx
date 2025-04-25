import { Label, FileInput as FlowbiteFileInput } from "flowbite-react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface FileInputProps<TFieldValue extends FieldValues> {
  label: string;
  register: UseFormRegister<TFieldValue>;
  name: Path<TFieldValue>;
  error?: string;
  required?: boolean;
}

const FileInput = <TFieldValue extends FieldValues>({
  label,
  register,
  name,
  error,
  required = false,
}: FileInputProps<TFieldValue>) => {
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
      <FlowbiteFileInput
        id={inputId}
        {...register(name as Path<TFieldValue>)}
        color={error && "failure"}
        helperText={
          error ? (
            <>
              <span className="font-medium">Oops!</span> {error}
            </>
          ) : null
        }
      />
    </div>
  );
};

export default FileInput;
