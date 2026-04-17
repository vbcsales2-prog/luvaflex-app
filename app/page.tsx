"use client";

import React, { useMemo, useState } from "react";

type BlindType =
  | "Outdoor"
  | "Venetian"
  | "Vertical"
  | "Panel Vertical"
  | "Lumi Voile"
  | "Verti Voile"
  | "Ambi Voile"
  | "Panel"
  | "Roller"
  | "Roman"
  | "Lumi Cell"
  | "Lumi Plisse"
  | "Doppio"
  | "Zebra";

type Item = {
  id: string;
  area: string;
  type: BlindType;
  width: number | "";
  drop: number | "";
  qty: number;

  fabric: string;
  colour: string;
  slat: string;
  fixture: string;
  control: string;
  remarks: string;

  manualPrice?: number;
  editingPrice?: boolean;
};

type ComputedItem = Item & {
  unit: number;
  total: number;
  pending?: boolean;
  custom?: boolean;
  manual?: boolean;
};

const TYPES: BlindType[] = [
  "Outdoor",
  "Venetian",
  "Vertical",
  "Panel Vertical",
  "Lumi Voile",
  "Verti Voile",
  "Ambi Voile",
  "Panel",
  "Roller",
  "Roman",
  "Lumi Cell",
  "Lumi Plisse",
  "Doppio",
  "Zebra",
];

const verticalFamily: BlindType[] = [
  "Vertical",
  "Panel Vertical",
  "Lumi Voile",
  "Verti Voile",
  "Ambi Voile",
  "Panel",
];

const WIDTH_STEPS_MM = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000];
const DROP_STEPS_MM = [1000, 1500, 2000, 2500, 3000, 3500];

const BASE_PRICE_GRID: Record<number, Record<number, number>> = {
  1000: { 1000: 1566, 1500: 1851, 2000: 2136, 2500: 2421, 3000: 2706, 3500: 2991, 4000: 3276, 4500: 3561, 5000: 3846, 5500: 4131, 6000: 4416 },
  1500: { 1000: 1746, 1500: 2091, 2000: 2436, 2500: 2781, 3000: 3126, 3500: 3471, 4000: 3816, 4500: 4161, 5000: 4506, 5500: 4851, 6000: 5196 },
  2000: { 1000: 1926, 1500: 2331, 2000: 2736, 2500: 3141, 3000: 3546, 3500: 3951, 4000: 4356, 4500: 4761, 5000: 5166, 5500: 5571, 6000: 5976 },
  2500: { 1000: 2106, 1500: 2571, 2000: 3036, 2500: 3501, 3000: 3966, 3500: 4431, 4000: 4896, 4500: 5361, 5000: 5826, 5500: 6291, 6000: 6756 },
  3000: { 1000: 2286, 1500: 2811, 2000: 3336, 2500: 3861, 3000: 4386, 3500: 4911, 4000: 5436, 4500: 5961, 5000: 6486, 5500: 7011, 6000: 7536 },
  3500: { 1000: 2466, 1500: 3051, 2000: 3636, 2500: 4221, 3000: 4806, 3500: 5391, 4000: 5976, 4500: 6561, 5000: 7146, 5500: 7731, 6000: 8316 },
};

const CLEAR_WINDOW_ADDON: Record<number, number> = {
  1000: 450,
  1500: 675,
  2000: 900,
  2500: 1125,
  3000: 1350,
  3500: 1575,
  4000: 1800,
  4500: 2025,
  5000: 2250,
  5500: 2475,
  6000: 2700,
};

const VAT_RATE = 0.15;

function roundUp(value: number, steps: number[]): number | null {
  for (const step of steps) {
    if (value <= step) return step;
  }
  return null;
}

function currency(value: number): string {
  return value.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getControlOptions(type: BlindType): string[] {
  if (verticalFamily.includes(type)) {
    return [
      "LHC/LHS",
      "LHC/RHS",
      "LHC/BP",
      "LHC/CENTRE",
      "RHC/LHS",
      "RHC/RHS",
      "RHC/BP",
      "RHC/CENTRE",
    ];
  }
  return ["RHC", "LHC"];
}

function getSlatMode(type: BlindType): "venetian" | "vertical" | "na" {
  if (type === "Venetian") return "venetian";
  if (verticalFamily.includes(type)) return "vertical";
  return "na";
}

function defaultSlat(type: BlindType): string {
  const mode = getSlatMode(type);
  if (mode === "venetian") return "25mm";
  if (mode === "vertical") return "90mm";
  return "";
}

function defaultFabric(type: BlindType): string {
  return type === "Outdoor" ? "Sheerweave" : "";
}

function defaultRemarks(type: BlindType): string {
  return type === "Outdoor" ? "With Window" : "";
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      area: "",
      type: "Outdoor",
      width: "",
      drop: "",
      qty: 1,
      fabric: "Sheerweave",
      colour: "",
      slat: "",
      fixture: "Rec",
      control: "RHC",
      remarks: "With Window",
    },
  ]);

  const update = <K extends keyof Item>(id: string, field: K, value: Item[K]) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        area: "",
        type: "Outdoor",
        width: "",
        drop: "",
        qty: 1,
        fabric: "Sheerweave",
        colour: "",
        slat: "",
        fixture: "Rec",
        control: "RHC",
        remarks: "With Window",
      },
    ]);
  };

  const computed: ComputedItem[] = useMemo(() => {
    return items.map((i) => {
      let unit = 0;
      let total = 0;
      let manual = false;
      let pending = false;
      let custom = false;

      if (i.type === "Outdoor") {
        if (i.width === "" || i.drop === "") {
          pending = true;
        } else {
          const widthMm = Math.ceil(Number(i.width) * 1000);
          const dropMm = Math.ceil(Number(i.drop) * 1000);

          const roundedWidth = roundUp(widthMm, WIDTH_STEPS_MM);
          const roundedDrop = roundUp(dropMm, DROP_STEPS_MM);

          if (!roundedWidth || !roundedDrop) {
            custom = true;
          } else {
            const base = BASE_PRICE_GRID[roundedDrop][roundedWidth];
            const addon = i.remarks === "With Window" ? CLEAR_WINDOW_ADDON[roundedWidth] : 0;
            unit = base + addon;
          }
        }
      } else {
        manual = true;
        if (typeof i.manualPrice === "number" && !Number.isNaN(i.manualPrice)) {
          unit = i.manualPrice;
        }
      }

      total = unit * (Number(i.qty) || 0);

      return { ...i, unit, total, manual, pending, custom };
    });
  }, [items]);

  const subtotal = computed.reduce((s, i) => s + i.total, 0);
  const vat = subtotal * VAT_RATE;
  const grandTotal = subtotal + vat;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Luvaflex Quote App</h1>

      <table border={1} cellPadding={6} style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Area</th>
            <th>Type</th>
            <th>Width</th>
            <th>Drop</th>
            <th>Fabric</th>
            <th>Colour</th>
            <th>Slat</th>
            <th>Fixture</th>
            <th>Control</th>
            <th>Remarks</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {computed.map((i) => (
            <tr key={i.id}>
              <td>
                <input value={i.area} onChange={(e) => update(i.id, "area", e.target.value)} />
              </td>

              <td>
                <select
                  value={i.type}
                  onChange={(e) => {
                    const newType = e.target.value as BlindType;
                    const controls = getControlOptions(newType);
                    update(i.id, "type", newType);
                    update(i.id, "control", controls[0]);
                    update(i.id, "fabric", defaultFabric(newType));
                    update(i.id, "remarks", defaultRemarks(newType));
                    update(i.id, "slat", defaultSlat(newType));
                    update(i.id, "manualPrice", undefined);
                    update(i.id, "editingPrice", false);
                  }}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <input
                  type="number"
                  step="0.001"
                  value={i.width}
                  onChange={(e) => update(i.id, "width", e.target.value === "" ? "" : Number(e.target.value))}
                />
              </td>

              <td>
                <input
                  type="number"
                  step="0.001"
                  value={i.drop}
                  onChange={(e) => update(i.id, "drop", e.target.value === "" ? "" : Number(e.target.value))}
                />
              </td>

              <td>
                {i.type === "Outdoor" ? (
                  <select value={i.fabric} onChange={(e) => update(i.id, "fabric", e.target.value)}>
                    <option value="Sheerweave">Sheerweave</option>
                    <option value="PVC">PVC</option>
                    <option value="Ribtext">Ribtext</option>
                  </select>
                ) : (
                  <input value={i.fabric} onChange={(e) => update(i.id, "fabric", e.target.value)} />
                )}
              </td>

              <td>
                <input value={i.colour} onChange={(e) => update(i.id, "colour", e.target.value)} />
              </td>

              <td>
                {getSlatMode(i.type) === "venetian" ? (
                  <select value={i.slat || "25mm"} onChange={(e) => update(i.id, "slat", e.target.value)}>
                    <option value="25mm">25mm</option>
                    <option value="50mm">50mm</option>
                  </select>
                ) : getSlatMode(i.type) === "vertical" ? (
                  <select value={i.slat || "90mm"} onChange={(e) => update(i.id, "slat", e.target.value)}>
                    <option value="90mm">90mm</option>
                    <option value="127mm">127mm</option>
                    <option value="250mm">250mm</option>
                  </select>
                ) : (
                  "N/A"
                )}
              </td>

              <td>
                <select value={i.fixture} onChange={(e) => update(i.id, "fixture", e.target.value)}>
                  <option value="Rec">Rec</option>
                  <option value="F/F">F/F</option>
                  <option value="Custom">Custom</option>
                </select>
              </td>

              <td>
                <select value={i.control} onChange={(e) => update(i.id, "control", e.target.value)}>
                  {getControlOptions(i.type).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                {i.type === "Outdoor" ? (
                  <select value={i.remarks} onChange={(e) => update(i.id, "remarks", e.target.value)}>
                    <option value="With Window">With Window</option>
                    <option value="Without Window">Without Window</option>
                  </select>
                ) : (
                  <input value={i.remarks} onChange={(e) => update(i.id, "remarks", e.target.value)} />
                )}
              </td>

              <td>
                <input
                  type="number"
                  value={i.qty}
                  onChange={(e) => update(i.id, "qty", Math.max(0, Number(e.target.value) || 0))}
                />
              </td>

              <td>
                {i.manual ? (
                  i.editingPrice ? (
                    <input
                      type="number"
                      defaultValue={i.manualPrice ?? ""}
                      onBlur={(e) => {
                        update(i.id, "manualPrice", Number(e.target.value) || 0);
                        update(i.id, "editingPrice", false);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      style={{ cursor: "pointer", color: "blue" }}
                      onClick={() => update(i.id, "editingPrice", true)}
                    >
                      {i.manualPrice ? currency(i.manualPrice) : "Manual Entry"}
                    </span>
                  )
                ) : i.pending ? (
                  "-"
                ) : i.custom ? (
                  <span style={{ color: "red", fontWeight: 600 }}>Custom Quote</span>
                ) : (
                  currency(i.unit)
                )}
              </td>

              <td>
                {i.pending ? "-" : i.custom ? "-" : i.total ? currency(i.total) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addItem} style={{ marginTop: 10 }}>
        Add Item
      </button>

      <div style={{ marginTop: 20 }}>
        <p>Subtotal: {currency(subtotal)}</p>
        <p>VAT: {currency(vat)}</p>
        <h2>Total: {currency(grandTotal)}</h2>
      </div>
      {/* ================= QUOTE PREVIEW ================= */}

<div style={{
  marginTop: 50,
  padding: 20,
  border: "2px solid #000",
  background: "#fff"
}}>

  {/* HEADER */}
  <div style={{ display: "flex", justifyContent: "space-between" }}>

    {/* COMPANY */}
    <div>
      <h2>VENETIAN BLIND CENTRE</h2>
      <p>Interior & Exterior Window Solutions</p>
      <p>Tel: 033 394 1941</p>
      <p>Email: info@venetian.co.za</p>
    </div>

    {/* QUOTE INFO */}
    <div>
      <p><b>Quote No:</b> __________</p>
      <p><b>Date:</b> __________</p>
      <p><b>Salesperson:</b> __________</p>
    </div>

  </div>

  {/* CLIENT */}
  <div style={{ marginTop: 20 }}>
    <p><b>Client Name:</b> __________________________</p>
    <p><b>Contact:</b> __________________________</p>
    <p><b>Address:</b> __________________________</p>
  </div>

  {/* TABLE */}
  <table border={1} cellPadding={6} style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th>Area</th>
        <th>Type</th>
        <th>Width (m)</th>
        <th>Drop (m)</th>
        <th>Fabric</th>
        <th>Colour</th>
        <th>Control</th>
        <th>Price</th>
      </tr>
    </thead>

    <tbody>
      {computed.map(i => (
        <tr key={i.id}>
          <td>{i.area}</td>
          <td>{i.type}</td>
          <td>{i.width}</td>
          <td>{i.drop}</td>
          <td>{i.fabric}</td>
          <td>{i.colour}</td>
          <td>{i.control}</td>
          <td>{i.total ? currency(i.total) : "-"}</td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* TOTALS */}
  <div style={{ marginTop: 20, textAlign: "right" }}>
    <p><b>Subtotal:</b> {currency(subtotal)}</p>
    <p><b>VAT:</b> {currency(vat)}</p>
    <h3>Total: {currency(grandTotal)}</h3>
  </div>

  {/* NOTES */}
  <div style={{ marginTop: 20 }}>
    <p><b>Notes:</b></p>
    <p>All quotations are valid for 7 days. Lead time 10–12 working days.</p>
  </div>

</div>
    </div>
  );
}
