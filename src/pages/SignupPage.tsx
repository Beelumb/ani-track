import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // New State for Username
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 // src/pages/SignupPage.tsx

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. VALIDATION: Check length
    if (username.length > 16) {
      throw new Error("Username must be 16 characters or less.");
    }

    // 2. CHECK UNIQUENESS (Optional but recommended for better UI feedback)
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUser) {
      throw new Error("Username already exists. Please choose another.");
    }

    // 3. SIGN UP
    // We pass the username in 'options.data'. The Trigger we made will handle the rest.
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // <--- This sends it to the Trigger
        },
      },
    });

    if (authError) throw authError;

    // Success! The trigger handled the profile creation.
    alert("Check your email for the confirmation link!");
    navigate("/login");

  } catch (error: any) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSignup} className="flex flex-col gap-4 w-80">
        
    
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={16} // UI Constraint
          className="p-2 rounded bg-secondary text-white border border-border focus:outline-none focus:border-accent"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-secondary text-white border border-border focus:outline-none focus:border-accent"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-secondary text-white border border-border focus:outline-none focus:border-accent"
          required
        />
        <button 
          disabled={loading}
          className="bg-primary text-white p-2 rounded hover:bg-primary/80 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-400">
        Already have an account? <Link to="/login" className="text-accent">Login</Link>
      </p>
    </div>
  );
}