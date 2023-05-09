import './custom.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import "@fontsource/roboto";

import LoginPage from './Page/Login/LoginPage'
import MainPage from "./Page/Main/MainPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path={'/login'} element={<LoginPage/>}/>
                <Route exact path={'/'} element={<MainPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
