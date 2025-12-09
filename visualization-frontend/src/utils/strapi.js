// API CALL TO STRAPI (FETCH STRAPI)

// src/utils/strapi.js
const STRAPI_URL = "http://localhost:1337/api";

export async function getFloorJson(floorNumber) {
  const res = await fetch(
    `${STRAPI_URL}/floors?filters[FloorNumber][$eq]=${floorNumber}`
  );
  const json = await res.json();

  if (!json.data || json.data.length === 0) {
    console.error("Floor not found in Strapi");
    return null;
  }

  return json.data[0].blueprintJson;
}
