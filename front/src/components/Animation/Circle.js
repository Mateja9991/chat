import '../../styles/Animation.css';

function Circle({ style, color = 'white' }) {
	return (
		<div style={{ ...style, borderColor: color }} class="rotating-circle-main">
			<div class="rotating-circle" style={{ backgroundColor: color }}></div>
		</div>
	);
}

export default Circle;
