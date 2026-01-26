import type {
	OldSessionTypes,
	OldSignClient,
	SessionTypes,
	SignClient,
} from "@/models/config";

interface GetClientSessionOpts {
	signClient: SignClient | OldSignClient;
	isOldClient: boolean;
}

export const getClientSession = ({
	signClient,
	isOldClient,
}: GetClientSessionOpts): SessionTypes.Struct | OldSessionTypes.Struct => {
	if (isOldClient) {
		const client = signClient as OldSignClient;
		return client.session.getAll()[0] as OldSessionTypes.Struct;
	}

	const client = signClient as SignClient;
	return client.session.getAll()[0] as SessionTypes.Struct;
};

export default getClientSession;
