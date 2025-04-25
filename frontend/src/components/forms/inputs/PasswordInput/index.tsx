"use client";

import { Label, TextInput as FlowbiteTextInput } from "flowbite-react";
import { useState } from "react";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface PasswordInputProps<TFieldValue extends FieldValues> {
  label: string;
  name: Path<TFieldValue> | string;
  register?: UseFormRegister<TFieldValue>;
  error?: string;
  required?: boolean;
}

const PasswordInput = <TFieldValue extends FieldValues>({
  label,
  name,
  register,
  error,
  required = false,
}: PasswordInputProps<TFieldValue>) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = `input-${name}`;

  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <Label
          htmlFor={name}
          color={error && "failure"}
          value={`${label} ${required ? "*" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="mr-0.5 text-gray-700 dark:text-gray-400"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <IoMdEyeOff className="w-5 h-5" />
          ) : (
            <FaEye className="w-5 h-5" />
          )}
        </button>
      </div>
      {register ? (
        <FlowbiteTextInput
          id={name}
          type={showPassword ? "text" : "password"}
          {...register(name as Path<TFieldValue>)}
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
          id={name}
          type={showPassword ? "text" : "password"}
          name={name}
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

export default PasswordInput;
