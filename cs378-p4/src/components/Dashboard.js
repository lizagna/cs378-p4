
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

function Dashboard() {
  const navigate = useNavigate();
  const [userId, setuserID] = useState("");
  const [email, setemail] = useState("");

  const [location, setLocation] = useState({
    "Austin": {"latitude":30.26715, "longitude":-97.74306},
    "Dallas": {"latitude":32.78306, "longitude":-96.80667},
    "Houston": {"latitude":29.76328, "longitude":-95.36327}
  });
  const [searchText, setSearchText] = useState("");
  const [city, setCity] = useState("Houston");
  const [times, setTimes] = useState([]);
  const [temperatures, setTemperatures] = useState([]);

  useEffect(() => {
    fetchWeather('Houston')
  },[]);

  const addLocation = () => {
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchText}`)
      .then((res) => res.json())
      .then(
        (json) => {
          if (json.results) {
            const match = json.results[0];
            setLocation({
              ...location, // retains original state using spread operator
              [match.name]: {
                latitude: match.latitude,
                longitude: match.longitude,
              },
            });
            setSearchText(""); // clears the search bar
          } else {
            alert(`Could not find weather for ${searchText}`);
          }
        },
        (error) => {}
      );
  };

  const fetchWeather = (city) => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location[city].latitude}&longitude=${location[city].longitude}&current_weather=true&hourly=temperature_2m&temperature_unit=fahrenheit`
    )
      .then((res) => res.json())
      .then(
        (json) => {
          if (json.hourly) {
            setTemperatures(json.hourly.temperature_2m);
            setTimes(json.hourly.time);
          }
          setCity(city);
        },
        (error) => {}
      );
  };

  let buttons = [];
  for (let loc in location) {
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