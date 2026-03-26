import { Outlet } from "react-router-dom";
import CommentInput from "./components/comments/CommentInput";
import RatingBar from "./components/comments/RatingBar";
import CommentItem from "./components/comments/CommentItem";
import { COMMENTS } from "./utils/MockData";
import CommentSection from "./components/comments/CommentSection";
const App = () => {
  return (
    <div className="bg-black">
      {/* Header chung cho mọi trang */}
      <h1 className="text-3xl font-bold underline text-red-500">Header</h1>
      <CommentInput />
      <RatingBar />
      <CommentSection />
      {/* Outlet là nơi các trang con (Home, About...) sẽ được render vào */}
      <Outlet />
    </div>
  );
};

export default App;
