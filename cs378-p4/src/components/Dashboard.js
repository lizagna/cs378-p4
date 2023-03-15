
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getDatabase, ref, child, get, set } from "firebase/database";


function Dashboard() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState({});
  const [searchText, setSearchText] = useState("");
  const [city, setCity] = useState("");
  const [times, setTimes] = useState([]);
  const [temperatures, setTemperatures] = useState([]);
  const [userId, setUserID] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // fetchWeather('Houston')
    /**
     * Listens for changes in the user authentication state
     */
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            setUserID(uid);
            // console.log("uid", uid);

            /**
             * When the user logs in, the function retrieves the data from the "users" node in 
             * the database for the currently authenticated user.
             */
            const dbRef = ref(getDatabase());
            get(child(dbRef, "users/" + uid))
                /**
                 * Successfully retrieves user data from database
                 */
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        let snapshotData = {};
                        /**
                         * Iterate over each child node and check if the key of the child node is equal
                         * to 'email.' If not, then adds the key-value pair to snapshotData. If equal,
                         * set email using setEmail().
                         */
                        snapshot.forEach((node) => {
                            if (node.key != "email") {
                                snapshotData[node.key] = node.val();
                            } else {
                                setEmail(node.val());
                            }
                        });

                        setLocations(snapshotData);
                        
                    } else {
                        console.log("No data available");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });

        } else {
            console.log("user logged out");
            navigate("/login");
        }
    });
  },[]);



  const addLocation = () => {
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchText}`)
      .then((res) => res.json()) // Parses the response as JSON and returns a Promise that resolves with the result
      .then(
        (json) => {
          if (json.results) {
            const match = json.results[0];
            const db = getDatabase();

            /**
             * Set the values in the Realtime Database of this user
             */
            set(ref(db, "users/" + userId + "/" + match.name), {
                latitude: match.latitude,
                longitude: match.longitude,
            });

            /**
             * Update the state of the locations
             */
            setLocations({
              ...locations, // retains original state using spread operator
              [match.name]: {
                latitude: match.latitude,
                longitude: match.longitude,
              },
            });
            setSearchText(""); // clears the search bar
            fetchWeather(match.name);

          } else {
            alert(`Could not find weather for ${searchText}`);
          }
        },
        (error) => {}
      );
  };

  /**
   * Grabs the weather of city from API call
   * @param {*} city [String] The city whose weather we want to see
   */
  const fetchWeather = (city) => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${locations[city].latitude}&longitude=${locations[city].longitude}&current_weather=true&hourly=temperature_2m&temperature_unit=fahrenheit`
    )
      .then((res) => res.json())
      .then(
        (json) => {
          if (json.hourly) {
            setTemperatures(json.hourly.temperature_2m);
            setTimes(json.hourly.time);
            setCity(city);
          }
        },
        (error) => {}
      );
  };

  let buttons = [];
  for (let loc in locations) {
    buttons.push(
      <button
        style={{
          marginTop: "5px",
          marginRight: "8px",
          paddingLeft: "8px",
          paddingRight: "8px",
          paddingTop: "5px",
          paddingBottom: "5px",
          fontSize: "18px",
          borderRadius: "5px",
          fontWeight: "bold",
          backgroundColor: city === loc ? "pink" : "",
        }}
        onClick={() => {
          fetchWeather(loc);
        }}
      >
        {loc}
      </button>
    );
  }

  const dt = new Date();
  let hour = dt.getHours();
  let tbRows = [];
  tbRows.push(
    <tr>
      <td
        style={{ 
          textAlign: "left", 
          fontSize: "18px",
          fontWeight: "bold",
          width: "90px"
      }}
      >
        Time
      </td>
      <td
        style={{ 
          textAlign: "right",
          fontSize: "18px",
          fontWeight: "bold", 
          width: "130px",
        }}
      >
        Temperature
      </td>
    </tr>
  );
  
  /**
   * Converts the time into 12-hour time
   */
  function convertTime(dt) {
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    const timeString = dt.toLocaleString('en-US', options);
    return timeString;
  }

  /**
   * Populates the table with the time and its corresponding temperature
   */
  for (let i = hour; i < hour + 10; i++) {
    if (temperatures[i]) {
      let currTime = new Date(times[i].toString());
      let currHour = convertTime(currTime);

      tbRows.push(
        <tr>
          <td
            style={{ 
              fontSize: "18px",
              width: "70px", 
              textAlign: "right",
              paddingRight: "10px",
              paddingTop: "5px",
            }}
           >
           {currHour}
          </td>
          <td
            style={{ 
              fontSize: "18px",
              width: "130px",
              textAlign: "right",
              paddingTop: "5px",
            }}
          >
          {temperatures[i] + " °F"}
          </td>
        </tr>
      );

    }
  }



  return (
    <div 
      style={{ 
        textAlign: "center", 
        margin: "30px" 
      }}
    >
      <div 
        style={{ 
          textAlign: "left" 
        }}
      >
        {buttons}
      </div>
      <div 
        style={{ 
          marginTop: "15px", display: "flex" }}>
        <input
          type="text"
          style={{
            marginRight: "10px",
            fontSize: "18px",
            width: "200px",
          }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          style={{
            marginRight: "10px",
            fontSize: "18px",
            width: "30px",
            height: "30px",
            borderRadius: "5px",
            fontWeight: "bold"
          }}
          onClick={addLocation}
        >
          +
        </button>
      </div>

      
      <table
          style={{
            marginTop: "30px",
          }}
      >
          {tbRows}
      </table>
    </div>
  );
}

export default Dashboard;