import { Outlet } from "react-router-dom";
import {useState} from "react"; 
const App = () => {
  const [show,setShow] = useState(false)
  return (
    <div>
      {/* Header chung cho mọi trang */}
      <h1 className="text-3xl font-bold underline text-red-500">Header</h1>
      
      
      {/* Outlet là nơi các trang con (Home, About...) sẽ được render vào */}
      <Outlet />
    </div>
  );
};

export default App;
