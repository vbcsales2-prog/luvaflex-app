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
  price: number;
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
  1000: {
    1000: 1566,
    1500: 1851,
    2000: 2136,
    2500: 2421,
    3000: 2706,
    3500: 2991,
    4000: 3276,
    4500: 3561,
    5000: 3846,
    5500: 4131,
    6000: 4416,
  },
  1500: {
    1000: 1746,
    1500: 2091,
    2000: 2436,
    2500: 2781,
    3000: 3126,
    3500: 3471,
    4000: 3816,
    4500: 4161,
    5000: 4506,
    5500: 4851,
    6000: 5196,
  },
  2000: {
    1000: 1926,
    1500: 2331,
    2000: 2736,
    2500: 3141,
    3000: 3546,
    3500: 3951,
    4000: 4356,
    4500: 4761,
    5000: 5166,
    5500: 5571,
    6000: 5976,
  },
  2500: {
    1000: 2106,
    1500: 2571,
    2000: 3036,
    2500: 3501,
    3000: 3966,
    3500: 4431,
    4000: 4896,
    4500: 5361,
    5000: 5826,
    5500: 6291,
    6000: 6756,
  },
  3000: {
    1000: 2286,
    1500: 2811,
    2000: 3336,
    2500: 3861,
    3000: 4386,
    3500: 4911,
    4000: 5436,
    4500: 5961,
    5000: 6486,
    5500: 7011,
    6000: 7536,
  },
  3500: {
    1000: 2466,
    1500: 3051,
    2000: 3636,
    2500: 4221,
    3000: 4806,
    3500: 5391,
    4000: 5976,
    4500: 6561,
    5000: 7146,
    5500: 7731,
    6000: 8316,
  },
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

function displayValue(value: string | number | "" | undefined): string {
  if (value === "" || value === undefined) return "-";
  return String(value);
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      area: "",
      type: "Outdoor",
      width: "",
      drop: "",
      fabric: "Sheerweave",
      colour: "",
      slat: "",
      fixture: "Rec",
      control: "RHC",
      remarks: "With Window",
    },
  ]);

  const update = <K extends keyof Item>(id: string, field: K, value: Item[K]) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
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
    return items.map((item) => {
      let price = 0;
      let pending = false;
      let custom = false;
      let manual = false;

      if (item.type === "Outdoor") {
        if (item.width === "" || item.drop === "") {
          pending = true;
        } else {
          const widthMm = Math.ceil(Number(item.width) * 1000);
          const dropMm = Math.ceil(Number(item.drop) * 1000);

          const roundedWidth = roundUp(widthMm, WIDTH_STEPS_MM);
          const roundedDrop = roundUp(dropMm, DROP_STEPS_MM);

          if (!roundedWidth || !roundedDrop) {
            custom = true;
          } else {
            const base = BASE_PRICE_GRID[roundedDrop][roundedWidth];
            const addon = item.remarks === "With Window" ? CLEAR_WINDOW_ADDON[roundedWidth] : 0;
            price = base + addon;
          }
        }
      } else {
        manual = true;
        if (typeof item.manualPrice === "number" && !Number.isNaN(item.manualPrice)) {
          price = item.manualPrice;
        }
      }

      return { ...item, price, pending, custom, manual };
    });
  }, [items]);

  const subtotal = computed.reduce((sum, item) => sum + item.price, 0);
  const vat = subtotal * VAT_RATE;
  const grandTotal = subtotal + vat;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Luvaflex Quote App</h1>

      <table
        border={1}
        cellPadding={6}
        style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Area</th>
            <th>Width</th>
            <th>Drop</th>
            <th>Type</th>
            <th>Fabric</th>
            <th>Colour</th>
            <th>Slat Width</th>
            <th>Fixture</th>
            <th>Control</th>
            <th>Remarks</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {computed.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  value={item.area}
                  onChange={(e) => update(item.id, "area", e.target.value)}
                />
              </td>

              <td>
                <input
                  type="number"
                  step="0.001"
                  value={item.width}
                  onChange={(e) =>
                    update(item.id, "width", e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  step="0.001"
                  value={item.drop}
                  onChange={(e) =>
                    update(item.id, "drop", e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </td>

              <td>
                <select
                  value={item.type}
                  onChange={(e) => {
                    const newType = e.target.value as BlindType;
                    const controls = getControlOptions(newType);
                    update(item.id, "type", newType);
                    update(item.id, "control", controls[0]);
                    update(item.id, "fabric", defaultFabric(newType));
                    update(item.id, "remarks", defaultRemarks(newType));
                    update(item.id, "slat", defaultSlat(newType));
                    update(item.id, "manualPrice", undefined);
                    update(item.id, "editingPrice", false);
                  }}
                >
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                {item.type === "Outdoor" ? (
                  <select
                    value={item.fabric}
                    onChange={(e) => update(item.id, "fabric", e.target.value)}
                  >
                    <option value="Sheerweave">Sheerweave</option>
                    <option value="PVC">PVC</option>
                    <option value="Ribtext">Ribtext</option>
                  </select>
                ) : (
                  <input
                    value={item.fabric}
                    onChange={(e) => update(item.id, "fabric", e.target.value)}
                  />
                )}
              </td>

              <td>
                <input
                  value={item.colour}
                  onChange={(e) => update(item.id, "colour", e.target.value)}
                />
              </td>

              <td>
                {getSlatMode(item.type) === "venetian" ? (
                  <select
                    value={item.slat || "25mm"}
                    onChange={(e) => update(item.id, "slat", e.target.value)}
                  >
                    <option value="25mm">25mm</option>
                    <option value="50mm">50mm</option>
                  </select>
                ) : getSlatMode(item.type) === "vertical" ? (
                  <select
                    value={item.slat || "90mm"}
                    onChange={(e) => update(item.id, "slat", e.target.value)}
                  >
                    <option value="90mm">90mm</option>
                    <option value="127mm">127mm</option>
                    <option value="250mm">250mm</option>
                  </select>
                ) : (
                  <span>N/A</span>
                )}
              </td>

              <td>
                <select
                  value={item.fixture}
                  onChange={(e) => update(item.id, "fixture", e.target.value)}
                >
                  <option value="Rec">Rec</option>
                  <option value="F/F">F/F</option>
                  <option value="Custom">Custom</option>
                </select>
              </td>

              <td>
                <select
                  value={item.control}
                  onChange={(e) => update(item.id, "control", e.target.value)}
                >
                  {getControlOptions(item.type).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                {item.type === "Outdoor" ? (
                  <select
                    value={item.remarks}
                    onChange={(e) => update(item.id, "remarks", e.target.value)}
                  >
                    <option value="With Window">With Window</option>
                    <option value="Without Window">Without Window</option>
                  </select>
                ) : (
                  <input
                    value={item.remarks}
                    onChange={(e) => update(item.id, "remarks", e.target.value)}
                  />
                )}
              </td>

              <td style={{ textAlign: "right", minWidth: 90 }}>
                {item.manual ? (
                  item.editingPrice ? (
                    <input
                      type="number"
                      defaultValue={item.manualPrice ?? ""}
                      onBlur={(e) => {
                        update(item.id, "manualPrice", Number(e.target.value) || 0);
                        update(item.id, "editingPrice", false);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      style={{ cursor: "pointer", color: "blue" }}
                      onClick={() => update(item.id, "editingPrice", true)}
                    >
                      {item.manualPrice ? currency(item.manualPrice) : "Manual Entry"}
                    </span>
                  )
                ) : item.pending ? (
                  "-"
                ) : item.custom ? (
                  <span style={{ color: "red", fontWeight: 600 }}>Custom Quote</span>
                ) : (
                  currency(item.price)
                )}
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

      <div
        style={{
          marginTop: 50,
          padding: 20,
          border: "2px solid #000",
          background: "#fff",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "2px solid black",
            marginBottom: 20,
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  width: "38%",
                  borderRight: "2px solid black",
                  padding: 8,
                  verticalAlign: "top",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <img
                      src="/logo.png"
                      alt="Venetian Blind Centre"
                      style={{ width: "100%", maxWidth: 420, height: "auto", display: "block" }}
                    />

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        lineHeight: "18px",
                        textAlign: "center",
                      }}
                    >
                      <div>442 Greyling Street</div>
                      <div>Pietermaritzburg</div>
                      <div>Tel: 033 394 1941</div>
                      <div>E-mail: info@venetian.co.za</div>
                      <div>www.venetian.co.za</div>
                      <div>VAT Reg. No: 4390246884</div>
                    </div>
                  </div>

                  <div
                    style={{
                      width: 150,
                      border: "1px solid black",
                      padding: 8,
                      fontSize: 11,
                      lineHeight: "16px",
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    <div>
                      <b>MONDAY TO FRIDAY - 7:30am TO 4:30pm</b>
                    </div>
                    <div>
                      <b>CLOSED FRIDAYS BETWEEN</b>
                    </div>
                    <div>
                      <b>11:30 & 2pm</b>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <b>SATURDAY - 7:30am TO 12:30pm</b>
                    </div>
                  </div>
                </div>
              </td>

              <td
                style={{
                  width: "42%",
                  borderRight: "2px solid black",
                  verticalAlign: "top",
                  padding: 0,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <tbody>
                    <tr>
                      <td style={{ borderBottom: "1px solid black", padding: "4px 6px" }}>
                        <b>INVOICE TO / NAME:</b>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ borderBottom: "1px solid black", padding: "4px 6px" }}>
                        <b>ADDRESS:</b>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ borderBottom: "1px solid black", padding: "4px 6px" }}>
                        <b>POSTAL ADDRESS:</b>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ borderBottom: "1px solid black", padding: "4px 6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>
                            <b>TEL: (HOME)</b>
                          </span>
                          <span>
                            <b>TEL: (WORK)</b>
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ borderBottom: "1px solid black", padding: "4px 6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>
                            <b>FAX:</b>
                          </span>
                          <span>
                            <b>CELL:</b>
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ borderBottom: "1px solid black", padding: "4px 6px" }}>
                        <b>E-MAIL:</b>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "4px 6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>
                            <b>CUSTOMER VAT NO:</b>
                          </span>
                          <span>
                            <b>O/NO:</b>
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              <td style={{ width: "20%", verticalAlign: "top", padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: "4px 6px",
                          textAlign: "center",
                        }}
                      >
                        <b>QUOTATION</b>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: "8px 6px",
                          textAlign: "center",
                        }}
                      >
                        Quote No:
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: "8px 6px",
                          textAlign: "center",
                        }}
                      >
                        SALESPERSON:
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: "8px 6px",
                          textAlign: "center",
                        }}
                      >
                        DATE:
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderBottom: "1px solid black",
                          padding: "8px 6px",
                          textAlign: "center",
                        }}
                      >
                        CONTACT PERSON:
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 6px", textAlign: "center" }}>
                        INTERNAL ORDER No:
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <table
          border={1}
          cellPadding={6}
          style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Area</th>
              <th>Width</th>
              <th>Drop</th>
              <th>Type</th>
              <th>Fabric</th>
              <th>Colour</th>
              <th>Slat Width</th>
              <th>Fixture</th>
              <th>Control</th>
              <th>Remarks</th>
              <th style={{ textAlign: "right" }}>Price</th>
            </tr>
          </thead>

          <tbody>
            {computed.map((item) => (
              <tr key={item.id}>
                <td>{displayValue(item.area)}</td>
                <td>{displayValue(item.width)}</td>
                <td>{displayValue(item.drop)}</td>
                <td>{displayValue(item.type)}</td>
                <td>{displayValue(item.fabric)}</td>
                <td>{displayValue(item.colour)}</td>
                <td>{getSlatMode(item.type) === "na" ? "N/A" : displayValue(item.slat)}</td>
                <td>{displayValue(item.fixture)}</td>
                <td>{displayValue(item.control)}</td>
                <td>{displayValue(item.remarks)}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>
                  {item.pending ? "-" : item.custom ? "-" : item.price ? currency(item.price) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 30, display: "flex", gap: 20 }}>
          <div style={{ flex: 1, border: "1px solid #000", padding: 10 }}>
            <p>
              <b>CUSTOMER CONFIRMATION</b>
            </p>
            <p>Name: __________________________</p>
            <p>Date: __________________________</p>
            <p>Signature: _____________________</p>
          </div>

          <div style={{ flex: 2, border: "1px solid #000", padding: 10 }}>
            <p>
              <b>PLEASE NOTE THE FOLLOWING:</b>
            </p>

            <p style={{ fontSize: 12, lineHeight: "18px" }}>
              All wood and bamboo blinds will be subject to imperfections, warpage & colour variations inherent in natural wood.
            </p>

            <p style={{ fontSize: 12, lineHeight: "18px" }}>
              We are not responsible for any damage whilst drilling through wall, brick, tile, granite & marble during installation.
            </p>

            <p style={{ fontSize: 12, lineHeight: "18px" }}>
              All awnings and outdoor blinds installed are not guaranteed against storm damage.
            </p>

            <p style={{ fontSize: 12, lineHeight: "18px" }}>
              For security measures all cash payments to be made instore.
            </p>
          </div>

          <div style={{ flex: 1, border: "1px solid #000", padding: 10 }}>
            <p style={{ textAlign: "center" }}>
              <b>QUOTE VALID FOR 7 DAYS</b>
            </p>

            <div style={{ marginTop: 20 }}>
              <p style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal:</span>
                <span>{currency(subtotal)}</span>
              </p>

              <p style={{ display: "flex", justifyContent: "space-between" }}>
                <span>VAT:</span>
                <span>{currency(vat)}</span>
              </p>

              <p
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  marginTop: 10,
                }}
              >
                <span>Total:</span>
                <span>{currency(grandTotal)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
