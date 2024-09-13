import "./App.css";
import { socket } from "./socket";
import { useState, useEffect } from "react";
import axios from "axios";

const headers = {
  "Content-Type": "multipart/form-data",
};

function App() {
  const [JWT, setJWT] = useState();
  const [ads, setAds] = useState([]);
  const [data, setData] = useState([]);

  // TODO: User authentication and ads socket connection
  useEffect(() => {
    // Sending audio data
    function sendData(data) {
      var form = new FormData();
      form.append("file", data, "data.wav");
      form.append("title", "data.wav");

      axios
        .post("http://127.0.0.1:5000/save-record", form, { headers })
        .then((response) => {
          console.log(response.data);
          if (response.data.length > 0) {
            setData(response.data);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }

    const audioHandler = () => {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          var audioChunks = [];

          mediaRecorder.addEventListener("dataavailable", (event) => {
            audioChunks.push(event.data);
          });

          mediaRecorder.addEventListener("start", () => {
            console.log("MediaRecorder started -> clearing chunks");
            audioChunks = [];
          });

          mediaRecorder.addEventListener("stop", () => {
            console.log("MediaRecorder stopped -> sending audio");
            // stopStream(mediaRecorder)
            // console.log(mediaRecorder.state)
            // console.log(mediaRecorder.stream)
            if (audioChunks.length > 0) {
              const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

              // socket.emit("audioIn", { data: audioBlob });
              // console.log(audioBlob);
              sendData(audioBlob);
            }
          });

          mediaRecorder.start();

          const intervalId = setInterval(() => {
            if (mediaRecorder.state === "recording") {
              mediaRecorder.stop();
            } else {
              mediaRecorder.start();
            }
          }, 9000);

          return () => {
            mediaRecorder.stop();
            clearInterval(intervalId);
          };
        })
        .catch((err) => {
          console.error("Err capturing audio.", err);
        });
    };

    audioHandler();

    return () => {};
  }, []);

  return (
    <div className="App">
      <p>hello Ads</p>
      {data.map((ad) => (
        <div key={ad.id}>
          <img src={ad.image} alt="img" width="200" height="200" />
          <p>{ad.name}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
