import { useState, useCallback } from "react";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export function useShipments() {
  const [shipmentData, setShipmentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/shipments`);
      const data = await res.json();
      setShipmentData(data || []);
    } catch (err) {
      console.error("Failed to fetch shipments", err);
      setShipmentData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    shipmentData,
    setShipmentData,
    loading,
    fetchShipments,
    API_BASE_URL,
  };
}