import { Routes, Route } from "react-router-dom";
import CurrencyList from "./page/home";
import App from "./page/app";



function Proyect() {
    return ( <>
    <Routes>
        <Route path="/" element={<> <CurrencyList/> <App/> </>}/>
    </Routes>
    </> );
}

export default Proyect;