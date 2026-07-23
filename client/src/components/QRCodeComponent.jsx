import React, { useRef, useMemo } from "react";
import QRCode from "react-qr-code";

// Установка (в проекте):
// npm install react-qr-code
// Tailwind CSS используется по желанию для внешнего вида

export default function QRCodeComponent({ userData, size = 192 }) {
  const svgRef = useRef(null);

  // Собираем полезную нагрузку для QR — строка JSON
  const payload = useMemo(() => {
    const data = {
      personalId: userData.personalId,
      name: userData.name ?? null,
      email: userData.email ?? null,
      generatedAt: new Date().toISOString(),
    };
    return JSON.stringify(data);
  }, [userData]);

  // Скачивание QR как PNG: сериализуем SVG -> нарисуем в canvas -> скачиваем
  const downloadPNG = async (filename = "qr.png") => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size * 2; // больше DPI
      canvas.height = size * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // белый фон
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // рисуем изображение (масштабируем)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      alert("Данные скопированы в буфер обмена");
    } catch (e) {
      alert("Не удалось скопировать — попробуйте вручную");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg w-max shadow-sm">
      <div className="bg-white p-2 rounded">
        <div style={{ height: size, width: size }}>
          <QRCode
            value={payload}
            size={size}
            viewBox={`0 0 ${size} ${size}`}
            level="M"
            renderAs="svg"
          />
        </div>
      </div>

      <div style={{ position: "absolute", left: -9999, top: -9999 }} aria-hidden>
        <div
          ref={(node) => {
            if (!node) return;
            const svg = node.querySelector("svg");
            if (svg) svgRef.current = svg;
          }}
        >
          <QRCode value={payload} size={size} level="M" renderAs="svg" />
        </div>
      </div>

      {/* <div className="flex gap-2">
        <button
          className="px-3 py-1 border rounded hover:bg-gray-50"
          onClick={() => downloadPNG(`qr_${userData.personalId}.png`)}
        >
          Скачать PNG
        </button>

        <button className="px-3 py-1 border rounded hover:bg-gray-50" onClick={copyToClipboard}>
          Копировать JSON
        </button>
      </div> */}

      {/* <div className="text-xs text-gray-500 mt-1"> {userData.personalId}</div> */}
    </div>
  );
}
