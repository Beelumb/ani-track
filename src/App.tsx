import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout";
import HomePage from "./pages/HomePage";
import Anime from "./pages/Anime";
import AnimePage from "./pages/AnimePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "./context/AuthContext";


console.log("Debugging: App loaded with basename /ani-track");

function App() {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <RootLayout />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: "anime",
            element: <Anime />,
          },
          {
            path: "/anime/:animeID/:slug",
            element: <AnimePage />,
          },
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "signup",
            element: <SignupPage />,
          },
          {
            path: "u/:usersNickname",
            element: <ProfilePage />,
          },
        ],
      },
    ],
    {
      basename: "/ani-track",
    }
  );

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
