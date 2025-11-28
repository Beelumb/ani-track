import { Outlet } from "react-router-dom";
import NavBar from "../components/navigation/NavBar";


function RootLayout() {

  // const navigation = useNavigation();

  return (
    <>
      <NavBar />
      <main className="container mx-auto mt-8 px-4 lg:mt-16">
        <Outlet/>
      </main>
    </>
  );
}

export default RootLayout;
