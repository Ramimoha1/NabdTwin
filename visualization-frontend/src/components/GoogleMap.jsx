/* 
--------------------------------
--------------------------------
NOT BEING USED OUT OF DATE
--------------------------------
--------------------------------

*/


// src/components/GoogleMap.jsx
import { useEffect } from "react";

export default function GoogleMap({ onBuildingClick }) {
  useEffect(() => {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 37.7744, lng: -122.4194 },
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
    });

    const marker = new google.maps.Marker({
      position: { lat: 37.7744, lng: -122.4194 },
      map,
      title: "Floors: 5",
    });

    marker.addListener("click", () => {
      onBuildingClick();
    });

    const infoWindow = new google.maps.InfoWindow({
      content: "<b>Floors: 5</b>",
    });

    marker.addListener("mouseover", () => infoWindow.open(map, marker));
    marker.addListener("mouseout", () => infoWindow.close());
  }, []);

  return <div id="map" style={{ width: "100vw", height: "100vh" }} />;
}
