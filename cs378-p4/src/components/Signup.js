import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { getDatabase, ref, child, get, set } from "firebase/database";

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
        const db = getDatabase();
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
    <div>
      <h1> Create an Account</h1>
      <form>
        <div>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email address"
          />
        </div>

        <div>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
        </div>

        <button type="submit" onClick={onCreateAccount}>
          Sign up
        </button>
      </form>

      <NavLink to="/login">Sign in</NavLink>
    </div>

    // <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    //     <h1>Create an Account</h1>
    //     <form style={{ width: '100%', maxWidth: '400px' }}>
    //         <div style={{ width: '100%' }}>
    //         <label>Email address</label>
    //         <input
    //             type="email"
    //             value={email}
    //             onChange={(e) => setEmail(e.target.value)}
    //             required
    //             placeholder="Email address"
    //             style={{ width: '60%', marginBottom: '10px' }}
    //         />
    //         </div>

    //         <div style={{ width: '100%' }}>
    //         <label>Password</label>
    //         <input
    //             type="password"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //             required
    //             placeholder="Password"
    //             style={{ width: '60%', marginBottom: '10px' }}
    //         />
    //         </div>

    //         <button type="submit" onClick={onCreateAccount}>
    //         Sign up
    //         </button>
    //     </form>

    //     <NavLink to="/login" style={{ marginTop: '10px' }}>
    //         Sign in
    //     </NavLink>
    // </div>

  );
};

export default Signup;
