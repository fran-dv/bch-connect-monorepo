import {
	Controller,
	type FieldValues,
	type Path,
	useFormContext,
} from "react-hook-form";

interface ControlledInputProps<T> {
	name: Path<T>;
	label: string;
	type?: string;
	placeholder?: string;
	disabled?: boolean;
	onChange?: (value: string | number | boolean) => void;
}

export const ControlledInput = <T extends FieldValues>({
	name,
	label,
	type = "text",
	placeholder,
	disabled,
	onChange,
}: ControlledInputProps<T>) => {
	const {
		control,
		formState: { errors },
	} = useFormContext<T>();
	const error = errors[name];

	return (
		<div className="flex flex-col gap-2 text-white-bch p-1 ">
			<label htmlFor={name} className="text-base md:text-lg pl-1">
				{label}
			</label>
			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<input
						className={
							"text-base border border-white-bch rounded-full py-2 px-3 focus:outline-1 focus:outline-green-bch focus:border-transparent"
						}
						id={name}
						type={type}
						placeholder={placeholder}
						disabled={disabled}
						aria-invalid={!!error}
						aria-describedby={error ? `${name}-error` : undefined}
						{...field}
						value={field.value ?? ""}
						onChange={(e) => {
							let value: string | number | boolean;
							if (type === "number") {
								value = e.target.value === "" ? "" : Number(e.target.value);
							} else if (type === "checkbox") {
								value = e.target.checked;
							} else {
								value = e.target.value;
							}
							field.onChange(value);
							if (onChange) onChange(value);
						}}
					/>
				)}
			/>
			<div
				className={"min-h-6 pl-2 text-rose-400 font-semibold text-sm italic"}
			>
				{error && (
					<p id={`${name}-error`} role="alert" className={""}>
						{error.message?.toString()}
					</p>
				)}
			</div>
		</div>
	);
};

export default ControlledInput;
