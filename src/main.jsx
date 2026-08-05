import { StrictMode } from "react" // helps React identify certain development problems, better for debug purposes
import { createRoot } from "react-dom/client" // createRoot connects our REACT application to the regular HTML page
import { HashRouter } from "react-router" // HashRouter gives all components within it access to routing features and prevents pages from breaking when somebody refreshes
import "./index.css" // global CSS
import App from "./App.jsx" // imports the app component from app.jsx

createRoot(document.getElementById("root")).render( // creates the REACT application, .render creates a REACT root using that HTML element
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)