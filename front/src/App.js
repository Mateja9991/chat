import MainForm from './MainForm.js';
import './styles/App.css';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
	return (
		<Router>
			<MainForm />
		</Router>
	);
}

export default App;
