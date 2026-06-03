import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// apple-touch-icon: el glifo "equity" (dos barras + igual) en el tile de marca.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f766e",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: "15px", height: "98px" }}>
          <div style={{ width: "23px", height: "63px", background: "#fff", borderRadius: "10px" }} />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "13px", height: "98px" }}>
            <div style={{ width: "27px", height: "14px", background: "#fff", borderRadius: "7px" }} />
            <div style={{ width: "27px", height: "14px", background: "#fff", borderRadius: "7px" }} />
          </div>
          <div style={{ width: "23px", height: "98px", background: "#fff", borderRadius: "10px" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
