import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title={<span className="text-black font-bold text-3xl">404</span>}
      subTitle={<span className="text-black">This page does not exist</span>}
      extra={
        <Button
          type="primary"
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </Button>
      }
    />
  );
};
export default NotFoundPage;
