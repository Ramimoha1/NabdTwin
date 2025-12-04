import { APIProvider, Map as GoogleMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import {Branch} from "../Types";

function Map({ branches }: { branches: Branch[] }) {
    const position = { lat: 30.0444, lng: 31.2357 };

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                defaultCenter={position}
                defaultZoom={10}
                mapId={import.meta.env.VITE_MAP_ID}
            >
                {branches.map((branch) => (
                    <AdvancedMarker
                        key={branch.id}
                        position={{ lat: branch.location.lat, lng: branch.location.lng }}
                    />
                ))}
            </GoogleMap>
        </APIProvider>
    );
}

export default Map;