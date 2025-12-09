/* 
--------------------------------
--------------------------------
NOT BEING USED OUT OF DATE
--------------------------------
--------------------------------

*/


// src/components/FloorPopup.jsx
import "./FloorPopup.css";

export default function FloorPopup({ visible, onSelectFloor, onClose }) {
  if (!visible) return null;

  return (
    <div className="floor-popup-overlay" onClick={onClose}>
      <div
        className="floor-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Select a Floor</h3>

        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            className="floor-button"
            onClick={() => onSelectFloor(num)}
          >
            Floor {num}
          </button>
        ))}
      </div>
    </div>
  );
}
