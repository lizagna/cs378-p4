import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { getDatabase, ref, child, get, set } from "firebase/database";


const Dashboard = () => {
  const navigate = useNavigate();

  const [locations, setLocations] = useState({}); // list of cities stored in the db for each user
  const [searchText, setSearchText] = useState("");
  const [city, setCity] = useState(""); // set to a default location
  const [times, setTimes] = useState([]);
  const [temperatures, setTemperatures] = useState([]);
  
  const [userId, setUserID] = useState("");
  const [email, setEmail] = useState("");

  const getCurrentLocation = (snapshotData) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const currentCity = "Current Location";
          const defaultCoordinates = {"latitude":latitude, "longitude":longitude};
          
          setLocations({...snapshotData, [currentCity]: defaultCoordinates});
          fetchWeather(currentCity, defaultCoordinates);
            
        });
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
  };

  useEffect(() => {
    /**
     * Listens for changes in the user authentication state
     */
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            setUserID(uid);
            /**
             * When the user logs in, the function retrieves the data from the "users" node in 
             * the database for the currently authenticated user.
             */
            const dbRef = ref(db);
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
                            if (node.key !== "email") {
                                snapshotData[node.key] = node.val();
                            } else {
                                setEmail(node.val());
                            }
                        });
                        console.log("*** snapshotdata in useEffect", snapshotData);
                        if (snapshotData && snapshotData !== "") {
                            getCurrentLocation(snapshotData);
                        } 
                    } else {
                        console.log("no weather");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            navigate("/login");
        }
    });
  },[]);



  const addLocation = () => {
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchText}`)
    /**
     * Parses the response as JSON and returns a Promise that resolves with the result
     */
      .then((res) => res.json()) 
      .then(
        (json) => {
          if (json.results) {
            const match = json.results[0];
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
          } else {
            console.log(searchText);
            if (searchText && searchText !== "") {
                alert(`Could not find weather for ${searchText}`);
            }
          }
        },
        (error) => {}
      );
  };

  /**
   * Grabs the weather of city from API call
   * @param {*} city The city whose weather we want to see
   */
  const fetchWeather = (city, currentCoordinates) => {
    if (!currentCoordinates) {
        currentCoordinates = locations[city];
    }
    const queryString = `latitude=${currentCoordinates.latitude}&longitude=${currentCoordinates.longitude}&current_weather=true&hourly=temperature_2m&temperature_unit=fahrenheit`;
    fetch(
      `https://api.open-meteo.com/v1/forecast?${queryString}`
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

  /**
   * Signs this current user out
   * Code from firebase documentation
   */
  const logout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
        // Sign-out successful.
      }).catch((error) => {
        // An error happened.
      });
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
  const convertTime = (dt) => {
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    const timeString = dt.toLocaleString('en-US', options);
    return timeString;
  };

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

      <button
        style={{
            marginRight: "10px",
            fontSize: "18px",
            width: "100px",
            height: "30px",
            borderRadius: "5px",
            fontWeight: "bold"
        }}
        onClick={logout}
    >
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;