import { BrowserRouter } from "react-router-dom"
import ReactDOM from "react-dom/client";
import App from './App.jsx'
import OccasioContextProvider from "./context/OccasioContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <OccasioContextProvider>
      <App />
    </OccasioContextProvider>
  </BrowserRouter>,
)
