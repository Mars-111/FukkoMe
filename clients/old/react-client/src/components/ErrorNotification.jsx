import React from 'react';
import { useAppContext } from '../AppContext';

function ErrorNotification({ onClose }) {
	const {errors} = useAppContext();

	return (
		<div style={{
			position: 'fixed',
			bottom: '20px',
			left: '50%',
			transform: 'translateX(-50%)',
			backgroundColor: '#f44336',
			color: 'white',
			padding: '10px 20px',
			borderRadius: '4px',
			zIndex: 1000
		}}>
		{
			errors.map(error => (
				<span>{error}</span>
			))
		}
		<button onClick={onClose} style={{
			marginLeft: '20px',
			background: 'none',
			border: 'none',
			color: 'white',
			cursor: 'pointer',
			fontSize: '1em'
		}}>X</button>
		</div>
	);
}

export default ErrorNotification;
