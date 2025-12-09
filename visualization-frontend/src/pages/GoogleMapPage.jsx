import { useEffect } from "react";

export default function GoogleMapPage() {
  useEffect(() => {

    // --- load Google Maps script dynamically ---
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyAJfqvYhF_ikn2L0s2HseWIUv4rerCvg7U&libraries=maps&v=beta";
    script.async = true;

    script.onload = () => {
      initGoogleMap();
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function initGoogleMap() {
    if (!window.google) return;

    let map;
    let is3D = false;

    // Popup function
    const showFloorSelection = (numFloors) => {
      
      const overlay = document.getElementById("floorPopupOverlay");
      const container = document.getElementById("floorButtons");

      container.innerHTML = "";

      for (let i = 1; i <= numFloors; i++) {
        const btn = document.createElement("button");
        btn.className = "floor-button";
        btn.innerText = `Floor ${i}`;
        btn.onclick = () => {
          window.location.href = "/blueprint-viewer.html?floor=" + i;

        };
        container.appendChild(btn);
      }

      overlay.style.display = "flex";
    };
    document.getElementById("floorPopupOverlay").addEventListener("click", function(e) {
      if (e.target.id === "floorPopupOverlay") {
        e.target.style.display = "none";
      }
    });
    // Initialize map
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 37.7744, lng: -122.4194 },
      zoom: 18,
      mapId: "3cbae9b23a589ccc1811e8bd",
      tilt: 0,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    const marker = new google.maps.Marker({
      position: { lat: 37.7744, lng: -122.4194 },
      map,
      title: "Floors: 5",
      
    });

    const info = new google.maps.InfoWindow({
      content: "<b>Floors: 5</b>",
    });

    marker.addListener("click", () => showFloorSelection(5));
    marker.addListener("mouseover", () => info.open(map, marker));
    marker.addListener("mouseout", () => info.close());

    document.getElementById("toggleButton").onclick = () => {
      is3D = !is3D;
      map.setTilt(is3D ? 45 : 0);
      map.setMapTypeId(is3D ? "satellite" : "roadmap");
      document.getElementById("toggleButton").innerText =
        is3D ? "Switch to 2D" : "Switch to 3D";
    };
  }

  return (
    <>
      <style>{`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden; /* Prevent ANY scrollbars */
  }

  #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  #map {
    position: fixed; 
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }

  #toggleButton {
    position: fixed;
    top: 20px;
    left: 20px;
    padding: 10px 20px;
    background-color: #007BFF;
    color: white;
    border: none;
    z-index: 10;
    cursor: pointer;
  }

  .floor-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .floor-popup-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }

  .floor-button {
    width: 100%;
    padding: 12px;
    margin: 5px 0;
    background: #007BFF;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }
`}</style>


      <button id="toggleButton">Switch to 3D</button>
      <div id="map"></div>

      <div id="floorPopupOverlay" className="floor-popup-overlay">
        <div className="floor-popup-content">
          <h3>Select a Floor</h3>
          <div id="floorButtons"></div>
        </div>
      </div>
    </>
  );
}
