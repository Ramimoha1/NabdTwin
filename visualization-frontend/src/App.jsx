import { useState, useEffect } from "react";
import GoogleMapPage from "./pages/GoogleMapPage";
//import ViewerPage from "./pages/ViewerPage";

export default function App() {
  const [page, setPage] = useState("home");
  const [floor, setFloor] = useState(null);

  // Make page setter globally accessible
  useEffect(() => {
    window.setPage = setPage;
  }, []);

  return (
    <>
      {page === "home" && (
        <div>
          <h1>Visualization Frontend</h1>
          <button onClick={() => setPage("map")}>Open Google Map</button>
          {/* <button onClick={() => setPage("viewer")}>Open Blueprint Viewer</button> TEST BLUEPRINT3D*/}
        </div>
      )}

      {page === "map" && (
        <GoogleMapPage
          onFloorSelect={(f) => {
            setFloor(f);
            setPage("viewer");
          }}
        />
      )}

      {page === "viewer" && <ViewerPage floor={floor} />}
    </>
  );
}
