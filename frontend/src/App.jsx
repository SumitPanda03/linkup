import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";
//import { Button } from "@chakra-ui/react";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage/>} exact />
        <Route path="/chats" element={<ChatPage/>} />
      </Routes>
    </div>
  );
}

export default App;
