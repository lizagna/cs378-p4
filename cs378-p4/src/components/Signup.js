import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { getDatabase, ref, set } from "firebase/database";

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Asynchronous function triggered when the user submits a form to create a new account
   * @param {*} e 
   */
  const onCreateAccount = async (e) => {
    /**
     * The function first prevents the default form submission behavior
     */
    e.preventDefault();

    /**
     * Create new user account with the specified email and password. 
     * If the account creation is successful, the function retrieves a reference 
     * to the Firebase Realtime Database
     */
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        /**
         * Save the user's email to the database at a location based on the user's unique ID
         */
        set(ref(db, "users/" + userCredential.user.uid + "/email"), email).then(
          () => {
            /**
             * If the database write is successful, the function navigates the user to the dashboard
             */
            navigate("/");
          }
        );
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1> Create an Account</h1>
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
              <button type="submit" onClick={onCreateAccount} style={{width: "150px"}}>
                Sign up
              </button>
            </td>
          </tr>
        </table>
      </form>

      <div style={{paddingTop: "10px", fontSize: "10px"}}>
        Already have an account? <NavLink to="/login">Sign in</NavLink>
      </div>
    </div>
  );
};

export default Signup;
