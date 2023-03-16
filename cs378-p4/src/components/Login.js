import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Logs the user into the app
   */
  const onLogin = (e) => {
    /**
     * The function first prevents the default form submission behavior
     */
    e.preventDefault();

    /**
     * Navigates to the dashboard if login is successful
     */
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Welcome Back!</h1>
      <form>
        <table>
          <tr>
            <td>Email</td>
          </tr>
          <tr>
            <td>
              <input
                type="email"
                required
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td>Password</td>
          </tr>
          <tr>
            <td>
              <input
                type="password"
                required
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td style={{textAlign: "center", paddingTop: "10px"}}>
              <button onClick={onLogin} style={{width: "150px"}}>
                Login
              </button>
            </td>
          </tr>
        </table>
      </form>

      <div style={{paddingTop: "10px", fontSize: "10px"}}>
        Don't have an account? <NavLink to="/signup">Sign up</NavLink>
      </div>
    </div>
  );
};

export default Login;
