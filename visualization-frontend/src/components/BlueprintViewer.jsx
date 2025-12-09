/* 
--------------------------------
--------------------------------
NOT BEING USED OUT OF DATE
--------------------------------
--------------------------------

*/


// src/components/BlueprintViewer.jsx
import { useEffect } from "react";
import { getFloorJson } from "../utils/strapi";

export default function BlueprintViewer({ floor }) {
  useEffect(() => {
    async function init() {
      const json = await getFloorJson(floor);
      if (!json) return;

      const opts = {
        floorplannerElement: "floorplanner-canvas",
        threeElement: "#viewer",
        threeCanvasElement: "three-canvas",
        textureDir: "/blueprint3d/textures/",
        widget: false,
      };

      const BP3D = window.BP3D;
      const blueprint3d = new BP3D.Blueprint3d(opts);

      blueprints.model.loadSerialized(json);
    }

    init();
  }, [floor]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div id="viewer"></div>
      <canvas id="three-canvas"></canvas>
      <div id="floorplanner-canvas"></div>
    </div>
  );
}
