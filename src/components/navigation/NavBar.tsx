import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function NavBar() {
  const { user, signOut } = useAuth(); // Get user state
  const [username, setUsername] = useState("");
  const [isScrolled, setIsScrolled] = useState(false); // State for scroll status

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(); // Wait for Supabase to finish signing out
    navigate("/anime"); // Redirect to the anime page
  };

  // 3. Effect to detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled down more than 0 pixels
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    async function getProfile() {
      if (!user) return;

      console.log("Fetching profile for user:", user.id); // Debugging line

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single(); // .single() throws an error if 0 or >1 rows are found

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        console.log("Profile found:", data); // Debugging line
        setUsername(data.username);
      }
    }

    getProfile();
  }, [user]); // Dependency array is correct

  return (
    <header
      className={`sticky top-0 z-10 w-full ${
        isScrolled ? "bg-black border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="container relative mx-auto flex min-h-16 items-center gap-4 px-4 md:gap-8">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
          <NavLink to="/">AniTrack</NavLink>
          {/* ... Anime Catalog Link ... */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <NavLink
              to="/anime"
              className={`inline-flex gap-2 items-center justify-center whitespace-nowrap text-sm font-medium transition-colors border border-border hover:bg-secondary hover:cursor-pointer h-10 rounded-md px-3 min-w-24 overflow-hidden`}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24 ">
                <path
                  fill="white"
                  d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19"
                ></path>
              </svg>
              <span className="flex-1 ">Anime Catalog</span>
            </NavLink>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {/* AUTH SECTION */}
          {user ? (
            // IF LOGGED IN: Show Avatar + Sign Out
            <div className="flex items-center gap-4">
              <button
                onClick={handleSignOut}
                className="text-xs text-discontinued-foreground hover:bg-discontinued-background/60 border border-discontinued-border bg-discontinued-background px-3 py-2 rounded-md transition-colors hover:cursor-pointer"
              >
                Sign Out
              </button>

              {/* Avatar Image */}
              <div className="relative size-10 overflow-hidden rounded-md border border-border">
                <Link to={`/u/${username}`}>
                  <img
                    className="aspect-square size-full object-cover"
                    alt="avatar"
                    src="https://img.freepik.com/free-photo/festive-animal-portrait-christmas_23-2151895791.jpg?semt=ais_hybrid&w=740&q=80"
                  />
                </Link>
              </div>
            </div>
          ) : (
            // IF LOGGED OUT: Show Login Button
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors  text-white hover:bg-secondary/80 h-10 rounded-default px-4"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex items-center justify-center  whitespace-nowrap text-sm font-medium transition-colors bg-primary text-primary-foreground border border-primary-border hover:bg-primary-border h-10 rounded-default px-4"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
