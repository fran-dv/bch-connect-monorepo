import { SquaresBackground } from "./components/SquaresBackground";

export const Background: React.FC = () => {
	return (
		<SquaresBackground
			speed={0.1}
			squareSize={60}
			direction="diagonal"
			borderColor="gray"
			hoverFillColor="rgba(10, 193, 142, 0.3)"
		/>
	);
};

export default Background;
