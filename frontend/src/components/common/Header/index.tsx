import Navbar from "./Navbar";

const Header = async ({ token }: { token: string }) => {
  return <Navbar token={token} />;
};

export default Header;
