import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = SITE.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social preview image (1200x630). Flexbox + CSS subset only (satori). The
// "equity" glyph is recreated with divs (two bars + equals sign).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f8f8",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <div
            style={{
              display: "flex",
              width: "76px",
              height: "76px",
              borderRadius: "20px",
              background: "#0f766e",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "42px" }}>
              <div style={{ width: "10px", height: "27px", background: "#fff", borderRadius: "4px" }} />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px", height: "42px" }}>
                <div style={{ width: "12px", height: "6px", background: "#fff", borderRadius: "3px" }} />
                <div style={{ width: "12px", height: "6px", background: "#fff", borderRadius: "3px" }} />
              </div>
              <div style={{ width: "10px", height: "42px", background: "#fff", borderRadius: "4px" }} />
            </div>
          </div>
          <div style={{ display: "flex", fontSize: "42px", fontWeight: 800 }}>
            <div style={{ color: "#102023" }}>Rate</div>
            <div style={{ color: "#0369a1" }}>Equity</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "68px",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
            }}
          >
            <div style={{ color: "#102023" }}>Compara el</div>
            <div style={{ color: "#0369a1" }}>valor económico real</div>
            <div style={{ color: "#102023" }}>de tu trabajo.</div>
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#4c6164" }}>
            Liquidez, beneficios, costo para la empresa, impuestos y valor por hora.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "24px", color: "#87a0a2", letterSpacing: "0.02em" }}>
          rate-equity.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
