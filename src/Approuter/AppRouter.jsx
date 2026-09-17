import React from "react";
import { 
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import Home from "../componant/home";
function AppRoute(props) {
    return (
      <Router {...props}>

       <Home/>
        <Routes>
             
          {/* <Route exact path="/" element={<Home />} />
          
            <Route path="contact" element={<Contact />} /> */}
          
        </Routes>
      </Router>
    );
  }
  export default AppRoute;