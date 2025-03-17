import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FiLogOut, FiMapPin, FiMove, FiMinus, FiLayers, FiTrash} from "react-icons/fi";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const center = {
  lat: -8.4095,
  lng: 115.1889,
};

const ClickableMap = ({ onMapClick, activeMode }) => {
  useMapEvents({
    click: async (e) => {
      if (!activeMode) return;
      const { lat, lng } = e.latlng;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const kabupaten = data.address?.county || "Tidak diketahui";
      onMapClick({ lat, lng, kabupaten });
    },
  });
  return null;
};

const MapControls = ({
  setMapType,
  activeMode,
  setActiveMode,
  isDraggable,
  setIsDraggable,
  selectedKabupaten,
  saveMarkers,
  logout,
  removeAllMarkers,
}) => {
  const toggleMode = useCallback((mode) => {
    setActiveMode((prev) => (prev === mode ? null : mode));
  }, [setActiveMode]);

  return (
    <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-50">
    <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
      <legend className="fieldset-legend text-primary">Map Type</legend>
      <select
        onChange={(e) => setMapType(e.target.value)}
        className="select select-sm select-primary w-full"
      >
        <option value="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png">
          Default
        </option>
        <option value="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png">
          Topo Map
        </option>
        <option value="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png">
          Humanitarian
        </option>
        <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}">
          Satellite
        </option>
      </select>
    </fieldset>

      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend text-primary">Fitur Marker</legend>
        <div className="flex gap-2">
          <button
            className={`btn ${
              activeMode === "multiMarker" ? "btn-success" : "btn-primary"
            } btn-sm`}
            onClick={() => toggleMode("multiMarker")}
          >
            <FiMapPin />
          </button>
          <button
            className={`btn ${isDraggable ? "btn-success" : "btn-primary"} btn-sm`}
            onClick={() => setIsDraggable(!isDraggable)}
          >
            <FiMove />
          </button>
          <button
            className={`btn ${
              activeMode === "drawLine" ? "btn-success" : "btn-primary"
            } btn-sm`}
            onClick={() => toggleMode("drawLine")}
          >
            <FiMinus />
          </button>
          <button
            className={`btn ${
              activeMode === "drawPolygon" ? "btn-success" : "btn-primary"
            } btn-sm`}
            onClick={() => toggleMode("drawPolygon")}
          >
            <FiLayers />
          </button> |
          <button
            onClick={() =>
              removeAllMarkers(
                activeMode === "drawLine"
                  ? "line"
                  : activeMode === "drawPolygon"
                  ? "polygon"
                  : "marker"
              )
            }
            className="btn btn-error btn-sm"
          >
            <FiTrash />
          </button>
        </div>
      </fieldset>

      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend text-primary">Add Marker</legend>
        <input type="text" className="input" placeholder="Nama Lokasi" />
        <input
          type="text"
          className="input mt-2"
          value={selectedKabupaten}
          readOnly
          placeholder="Kabupaten"
        />
        <div className="flex justify-center gap-2">
          <button
            onClick={() => toggleMode("addMarker")}
            className={`btn ${
              activeMode === "addMarker" ? "btn-success" : "btn-primary"
            } btn-sm mt-2`}
          >
            <FiMapPin className="mr-2" />
            {activeMode === "addMarker"
              ? "Click on Map to Add"
              : "Add Marker"}
          </button>
          <button onClick={saveMarkers} className="btn btn-primary btn-sm mt-2">
            Save
          </button>
        </div>
      </fieldset>

      <div className="flex justify-end">
        <button onClick={logout} className="btn btn-error flex justify-end btn-sm mt-2">
          <FiLogOut />
        </button>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [mapType, setMapType] = useState(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  const [markers, setMarkers] = useState([]);
  const [lineMarkers, setLineMarkers] = useState([]);
  const [polygonMarkers, setPolygonMarkers] = useState([]);
  const [activeMode, setActiveMode] = useState(null);
  const [isDraggable, setIsDraggable] = useState(false);
  const [selectedKabupaten, setSelectedKabupaten] = useState("");

  const handleMapClick = useCallback(
    (marker) => {
      setSelectedKabupaten(marker.kabupaten);
      switch (activeMode) {
        case "multiMarker":
          setMarkers((prev) => [...prev, marker]);
          break;
        case "addMarker":
          setMarkers([marker]);
          setActiveMode(null);
          break;
        case "drawLine":
          setLineMarkers((prev) => [...prev, marker]);
          break;
        case "drawPolygon":
          setPolygonMarkers((prev) => [...prev, marker]);
          break;
        default:
          break;
      }
    },
    [activeMode]
  );

  const handleMarkerDrag = useCallback(async (index, e) => {
    const { lat, lng } = e.target.getLatLng();
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const kabupaten = data.address?.county || "Tidak diketahui";
      setMarkers((prevMarkers) =>
        prevMarkers.map((marker, i) =>
          i === index ? { lat, lng, kabupaten } : marker
        )
      );

      } catch (error) {
      console.error("Gagal mengambil data lokasi:", error);
    }
  }, [setMarkers]);

  const handleLineMarkerDrag = useCallback(async (index, e) => {
    const { lat, lng } = e.target.getLatLng();
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const kabupaten = data.address?.county || "Tidak diketahui";
      setLineMarkers((prev) =>
        prev.map((marker, i) =>
          i === index ? { lat, lng, kabupaten } : marker
        )
      );
    } catch (error) {
      console.error("Gagal mengambil data lokasi:", error);
    }
  }, [setLineMarkers]);

  const handlePolygonMarkerDrag = useCallback(async (index, e) => {
    const { lat, lng } = e.target.getLatLng();
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const kabupaten = data.address?.county || "Tidak diketahui";
      setPolygonMarkers((prev) =>
        prev.map((marker, i) =>
          i === index ? { lat, lng, kabupaten } : marker
        )
      );
    } catch (error) {
      console.error("Gagal mengambil data lokasi:", error);
    }
  }, [setPolygonMarkers]);

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:1126/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        localStorage.removeItem("token");
        navigate("/login");
        toast.success("Logout berhasil!"); // Notifikasi toast berhasil
      } else {
        toast.error("Logout gagal. Silakan coba lagi."); // Notifikasi toast gagal
      }
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Terjadi kesalahan saat logout."); // Notifikasi toast kesalahan
    }
  }, [navigate]);

  const saveMarkers = useCallback(() => {
    // Implementasi logika penyimpanan marker
    console.log("Markers disimpan:", markers);
  }, [markers]);

  const activeMapClickHandler = useMemo(() => {
    switch (activeMode) {
      case "drawLine":
        return handleMapClick;
      case "drawPolygon":
        return handleMapClick;
      default:
        return handleMapClick;
    }
  }, [activeMode, handleMapClick]);

  const removeMarker = useCallback((markerType, indexToRemove, setMarkersFunction) => {
    setMarkersFunction((prevMarkers) =>
      prevMarkers.filter((_, index) => index !== indexToRemove)
    );
  }, []);
  
  const removeAllMarkers = useCallback((markerType) => {
    if (markerType === "marker") {
      setMarkers([]);
    } else if (markerType === "line") {
      setLineMarkers([]);
    } else if (markerType === "polygon") {
      setPolygonMarkers([]);
    }
  }, [setMarkers, setLineMarkers, setPolygonMarkers]);

  return (
    <div style={mapContainerStyle}>
      <MapControls
        mapType={mapType}
        setMapType={setMapType}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        isDraggable={isDraggable}
        setIsDraggable={setIsDraggable}
        selectedKabupaten={selectedKabupaten}
        addMarker={() => setActiveMode("addMarker")}
        saveMarkers={saveMarkers}
        logout={handleLogout}
        removeAllMarkers={(markerType) => removeAllMarkers(markerType)}
      />
      <MapContainer center={[center.lat, center.lng]} zoom={10} style={{ height: "100%", width: "100%" }}>
        <Toaster position="bottom-right" reverseOrder={false} />
          <TileLayer
            url={mapType}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        <ClickableMap onMapClick={activeMapClickHandler} activeMode={activeMode} />
        {markers.map((marker, index) => (
        <Marker
            key={index}
            position={[marker.lat, marker.lng]}
            draggable={isDraggable}
            eventHandlers={isDraggable ? { dragend: (e) => handleMarkerDrag(index, e) } : {}}
          >
            <Popup>
              Marker ke-{index + 1} - {marker.kabupaten}
              <br />
              <div className="flex justify-center">
                <button
                  className="btn btn-error btn-xs mt-2"
                  onClick={() => removeMarker("marker", index, setMarkers)}
                >
                  <FiTrash />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        {lineMarkers.length > 0 && (
          <>
            <Polyline positions={lineMarkers.map((m) => [m.lat, m.lng])} color="blue" />
            {lineMarkers.map((marker, index) => (
              <Marker
                key={`line-${index}`}
                position={[marker.lat, marker.lng]}
                draggable={isDraggable}
                eventHandlers={isDraggable ? { dragend: (e) => handleLineMarkerDrag(index, e) } : {}}
              >
                <Popup>
                  Titik Garis {index + 1} - {marker.kabupaten}
                  <br />
                  <div className="flex justify-center">
                    <button
                      className="btn btn-error btn-xs mt-2"
                      onClick={() => removeMarker("line", index, setLineMarkers)}
                    >
                      <FiTrash />
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
        {polygonMarkers.length > 0 && (
          <>
            <Polygon positions={polygonMarkers.map((m) => [m.lat, m.lng])} color="red" />
            {polygonMarkers.map((marker, index) => (
              <Marker
                key={`polygon-${index}`}
                position={[marker.lat, marker.lng]}
                draggable={isDraggable}
                eventHandlers={isDraggable ? { dragend: (e) => handlePolygonMarkerDrag(index, e) } : {}}
              >
                <Popup>
                  Titik Polygon {index + 1} - {marker.kabupaten}
                  <br />
                  <div className="flex justify-center">
                    <button
                      className="btn btn-error btn-xs mt-2"
                      onClick={() => removeMarker("polygon", index, setPolygonMarkers)}
                    >
                      <FiTrash />
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default HomePage;