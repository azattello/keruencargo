// src/components/QRScanner.jsx
import React, { useState } from "react";
import { useZxing } from "react-zxing";

const QRScanner = ({ onScan }) => {
  const [error, setError] = useState(null);

  const { ref } = useZxing({
    onDecodeResult(result) {
      const text = result.getText();
      if (onScan) onScan(text); // передаём наверх
    },
    onError(err) {
      setError(err?.message || "Ошибка при сканировании");
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <video
        ref={ref}
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "12px",
          border: "2px solid #ccc",
        }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default QRScanner;
