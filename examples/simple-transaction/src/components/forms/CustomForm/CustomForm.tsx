import clsx from "clsx";
import type React from "react";
import {
	type FieldValues,
	FormProvider,
	type SubmitHandler,
	type UseFormReturn,
} from "react-hook-form";

interface Props<T extends FieldValues>
	extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
	methods: UseFormReturn<T>;
	onSubmit: SubmitHandler<T>;
	children: React.ReactNode;
	className?: string;
}

export const CustomForm = <T extends FieldValues>({
	methods,
	onSubmit,
	children,
	className = "",
	...rest
}: Props<T>) => {
	return (
		<FormProvider {...methods}>
			<form
				{...rest}
				onSubmit={methods.handleSubmit(onSubmit)}
				className={clsx("flex flex-col gap-2 w-full", className)}
			>
				{children}
			</form>
		</FormProvider>
	);
};
