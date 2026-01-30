import { decodeCashAddress } from "@bitauth/libauth";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { ControlledInput } from "@/components/forms/ControlledInput";
import { CustomForm } from "@/components/forms/CustomForm";
import { SubmitButton } from "@/components/forms/SubmitButton";

const TransferFormSchema = z.object({
	recipient: z
		.string({ required_error: "Recipient is required" })
		.refine((addr) => {
			const result = decodeCashAddress(addr);
			return typeof result !== "string";
		}, "Invalid address. It must be in cashAddress format"),
	satoshis: z
		.number({ required_error: "Satoshis amount is required" })
		.nonnegative("Amount must be positive")
		.min(550, "Minimum amount is 550 satoshis"),
});

export type TransferFormValues = z.infer<typeof TransferFormSchema>;

interface Props {
	onSubmit: (values: TransferFormValues) => Promise<void>;
	isLoading: boolean;
}

export const TransferForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
	const methods = useForm<TransferFormValues>({
		defaultValues: {
			recipient: "",
			satoshis: undefined,
		},
		resolver: zodResolver(TransferFormSchema),
	});

	const reset = useCallback(() => {
		methods.reset();
	}, [methods]);

	const handleSubmit = async (values: TransferFormValues) => {
		console.log("submit values", values);
		await onSubmit(values);
		reset();
	};

	return (
		<CustomForm onSubmit={handleSubmit} methods={methods}>
			<div>
				<ControlledInput
					name="recipient"
					label="Recipient address"
					type="text"
					placeholder="e.g. bchtest:qz354mlhwdcf0j8ll67nejz8ce3qh2e6vv4qwlrjgr"
				/>
			</div>
			<div>
				<ControlledInput
					name="satoshis"
					label="Amount in satoshis"
					type="number"
					placeholder="e.g. 10000"
				/>
			</div>

			<SubmitButton disabled={isLoading}>
				{isLoading ? "Awaiting signature..." : "Transfer"}
			</SubmitButton>
		</CustomForm>
	);
};

export default TransferForm;
