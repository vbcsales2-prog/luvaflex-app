"use client";

import React, { useMemo, useState } from "react";

type BlindType =
  | ""
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
  "",
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
    1000: 1566, 1500: 1851, 2000: 2136, 2500: 2421, 3000: 2706,
    3500: 2991, 4000: 3276, 4500: 3561, 5000: 3846, 5500: 4131, 6000: 4416,
  },
  1500: {
    1000: 1746, 1500: 2091, 2000: 2436, 2500: 2781, 3000: 3126,
    3500: 3471, 4000: 3816, 4500: 4161, 5000: 4506, 5500: 4851, 6000: 5196,
  },
  2000: {
    1000: 1926, 1500: 2331, 2000: 2736, 2500: 3141, 3000: 3546,
    3500: 3951, 4000: 4356, 4500: 4761, 5000: 5166, 5500: 5571, 6000: 5976,
  },
  2500: {
    1000: 2106, 1500: 2571, 2000: 3036, 2500: 3501, 3000: 3966,
    3500: 4431, 4000: 4896, 4500: 5361, 5000: 5826, 5500: 6291, 6000: 6756,
  },
  3000: {
    1000: 2286, 1500: 2811, 2000: 3336, 2500: 3861, 3000: 4386,
    3500: 4911, 4000: 5436, 4500: 5961, 5000: 6486, 5500: 7011, 6000: 7536,
  },
  3500: {
    1000: 2466, 1500: 3051, 2000: 3636, 2500: 4221, 3000: 4806,
    3500: 5391, 4000: 5976, 4500: 6561, 5000: 7146, 5500: 7731, 6000: 8316,
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
  if (type === "") return [];
  return ["RHC", "LHC"];
}

function getSlatMode(type: BlindType): "venetian" | "vertical" | "na" {
  if (type === "Venetian") return "venetian";
  if (verticalFamily.includes(type)) return "vertical";
  return "na";
}

function displayValue(value: string | number | "" | undefined): string {
  if (value === "" || value === undefined) return "-";
  return String(value);
}

export default function Page() {
  const [quoteMeta, setQuoteMeta] = useState({
    invoiceName: "",
    address: "",
    postalAddress: "",
    telHome: "",
    telWork: "",
    fax: "",
    cell: "",
    email: "",
    vatNo: "",
    orderNo: "",
    quoteNo: "",
    salesperson: "",
    date: "",
    contactPerson: "",
    internalOrderNo: "",
  });

  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      area: "",
      type: "",
      width: "",
      drop: "",
      fabric: "",
      colour: "",
      slat: "",
      fixture: "",
      control: "",
      remarks: "",
      manualPrice: undefined,
      editingPrice: false,
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
        type: "",
        width: "",
        drop: "",
        fabric: "",
        colour: "",
        slat: "",
        fixture: "",
        control: "",
        remarks: "",
        manualPrice: undefined,
        editingPrice: false,
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
      } else if (item.type !== "") {
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
  const referenceValue = quoteMeta.quoteNo || "0";

  return (
    <div style={{ padding: 8, fontFamily: "Arial", background: "#fff", color: "#000" }}>
      <style>{`
        .quote-input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font: inherit;
          padding: 0;
          margin: 0;
        }

        .quote-input-center {
          text-align: center;
        }

        .quote-input-right {
          text-align: right;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 4mm;
          }

          body {
            margin: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .print-only-quote {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-root {
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-scale {
            transform: scale(0.94);
            transform-origin: top left;
            width: 106.5%;
          }

          .quote-input {
            border: none !important;
            outline: none !important;
            background: transparent !important;
            box-shadow: none !important;
            appearance: none !important;
            -webkit-appearance: none !important;
          }

          select.quote-input {
            color: transparent;
            text-shadow: 0 0 0 #000;
          }
        }
      `}</style>

      <div className="print-root">
        <div className="no-print">
          <h1 style={{ margin: "0 0 10px 0", fontSize: 18 }}>Luvaflex Quote App</h1>

          <table
            border={1}
            cellPadding={6}
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
              border: "2px solid #000",
            }}
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
                      style={{ width: "100%" }}
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
                      style={{ width: "100%" }}
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
                      style={{ width: "100%" }}
                    />
                  </td>

                  <td>
                    <select
                      value={item.type}
                      onChange={(e) => {
                        const newType = e.target.value as BlindType;
                        update(item.id, "type", newType);
                        update(item.id, "fabric", "");
                        update(item.id, "slat", "");
                        update(item.id, "fixture", "");
                        update(item.id, "control", "");
                        update(item.id, "remarks", "");
                        update(item.id, "manualPrice", undefined);
                        update(item.id, "editingPrice", false);
                      }}
                      style={{ width: "100%" }}
                    >
                      <option value=""></option>
                      {TYPES.filter(Boolean).map((type) => (
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
                        style={{ width: "100%" }}
                      >
                        <option value=""></option>
                        <option value="Sheerweave">Sheerweave</option>
                        <option value="PVC">PVC</option>
                        <option value="Ribtext">Ribtext</option>
                      </select>
                    ) : (
                      <input
                        value={item.fabric}
                        onChange={(e) => update(item.id, "fabric", e.target.value)}
                        style={{ width: "100%" }}
                      />
                    )}
                  </td>

                  <td>
                    <input
                      value={item.colour}
                      onChange={(e) => update(item.id, "colour", e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </td>

                  <td>
                    {getSlatMode(item.type) === "venetian" ? (
                      <select
                        value={item.slat}
                        onChange={(e) => update(item.id, "slat", e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <option value=""></option>
                        <option value="25mm">25mm</option>
                        <option value="50mm">50mm</option>
                      </select>
                    ) : getSlatMode(item.type) === "vertical" ? (
                      <select
                        value={item.slat}
                        onChange={(e) => update(item.id, "slat", e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <option value=""></option>
                        <option value="90mm">90mm</option>
                        <option value="127mm">127mm</option>
                        <option value="250mm">250mm</option>
                      </select>
                    ) : (
                      <input
                        value={item.slat}
                        onChange={(e) => update(item.id, "slat", e.target.value)}
                        style={{ width: "100%" }}
                      />
                    )}
                  </td>

                  <td>
                    <select
                      value={item.fixture}
                      onChange={(e) => update(item.id, "fixture", e.target.value)}
                      style={{ width: "100%" }}
                    >
                      <option value=""></option>
                      <option value="Rec">Rec</option>
                      <option value="F/F">F/F</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </td>

                  <td>
                    {item.type === "" ? (
                      <input
                        value={item.control}
                        onChange={(e) => update(item.id, "control", e.target.value)}
                        style={{ width: "100%" }}
                      />
                    ) : (
                      <select
                        value={item.control}
                        onChange={(e) => update(item.id, "control", e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <option value=""></option>
                        {getControlOptions(item.type).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  <td>
                    {item.type === "Outdoor" ? (
                      <select
                        value={item.remarks}
                        onChange={(e) => update(item.id, "remarks", e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <option value=""></option>
                        <option value="With Window">With Window</option>
                        <option value="Without Window">Without Window</option>
                      </select>
                    ) : (
                      <input
                        value={item.remarks}
                        onChange={(e) => update(item.id, "remarks", e.target.value)}
                        style={{ width: "100%" }}
                      />
                    )}
                  </td>

                  <td style={{ textAlign: "right", minWidth: 95 }}>
                    {item.type === "" ? (
                      "-"
                    ) : item.type === "Outdoor" ? (
                      item.pending ? (
                        "-"
                      ) : item.custom ? (
                        <span style={{ color: "red", fontWeight: 600 }}>Custom Quote</span>
                      ) : item.price ? (
                        currency(item.price)
                      ) : (
                        "-"
                      )
                    ) : item.editingPrice ? (
                      <input
                        type="number"
                        defaultValue={item.manualPrice ?? ""}
                        onBlur={(e) => {
                          update(item.id, "manualPrice", Number(e.target.value) || 0);
                          update(item.id, "editingPrice", false);
                        }}
                        autoFocus
                        style={{ width: "100%" }}
                      />
                    ) : (
                      <span
                        style={{ cursor: "pointer", color: "blue" }}
                        onClick={() => update(item.id, "editingPrice", true)}
                      >
                        {typeof item.manualPrice === "number" ? currency(item.manualPrice) : "Manual Entry"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addItem} style={{ marginTop: 8 }}>
            Add Item
          </button>

          <div style={{ marginTop: 12 }}>
            <p style={{ margin: "0 0 6px 0" }}>Subtotal: {currency(subtotal)}</p>
            <p style={{ margin: "0 0 8px 0" }}>VAT: {currency(vat)}</p>
            <h2 style={{ margin: 0, fontSize: 20 }}>Total: {currency(grandTotal)}</h2>
          </div>
        </div>

        <div className="print-only-quote print-scale" style={{ marginTop: 24 }}>
          <div
            style={{
              padding: 5,
              border: "2px solid #000",
              background: "#fff",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "2px solid #000",
                marginBottom: 5,
                tableLayout: "fixed",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "38%",
                      borderRight: "2px solid #000",
                      padding: "3px 5px",
                      verticalAlign: "top",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      <img
                        src="/logo.png"
                        alt="Venetian Blind Centre"
                        style={{
                          width: "100%",
                          maxWidth: 500,
                          height: "auto",
                          display: "block",
                          marginBottom: 3,
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            marginTop: 1,
                            fontSize: 10.5,
                            lineHeight: "12px",
                            textAlign: "left",
                            flex: 1,
                          }}
                        >
                          <div>442 Greyling Street</div>
                          <div>Pietermaritzburg</div>
                          <div>Tel: 033 394 1941</div>
                          <div>E-mail: info@venetian.co.za</div>
                          <div>www.venetian.co.za</div>
                          <div>VAT Reg. No: 4390246884</div>
                        </div>

                        <div
                          style={{
                            width: 122,
                            border: "1px solid #000",
                            padding: "5px 4px",
                            fontSize: 8.8,
                            lineHeight: "11.5px",
                            textAlign: "center",
                            marginTop: 14,
                            marginRight: 2,
                          }}
                        >
                          <div><b>MONDAY TO FRIDAY - 7:30am TO 4:30pm</b></div>
                          <div style={{ marginTop: 1 }}><b>CLOSED FRIDAYS BETWEEN</b></div>
                          <div><b>11:30 & 2pm</b></div>
                          <div style={{ marginTop: 1 }}><b>SATURDAY - 7:30am TO 12:30pm</b></div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td
                    style={{
                      width: "42%",
                      borderRight: "2px solid #000",
                      verticalAlign: "top",
                      padding: 0,
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, height: "100%" }}>
                      <tbody>
                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 4px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "145px 1fr", alignItems: "center" }}>
                              <span><b>INVOICE TO / NAME:</b></span>
                              <input
                                className="quote-input"
                                value={quoteMeta.invoiceName}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, invoiceName: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 4px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "145px 1fr", alignItems: "center" }}>
                              <span><b>ADDRESS:</b></span>
                              <input
                                className="quote-input"
                                value={quoteMeta.address}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, address: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 4px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "145px 1fr", alignItems: "center" }}>
                              <span><b>POSTAL ADDRESS:</b></span>
                              <input
                                className="quote-input"
                                value={quoteMeta.postalAddress}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, postalAddress: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 4px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center" }}>
                                <span><b>TEL: (HOME)</b></span>
                                <input
                                  className="quote-input"
                                  value={quoteMeta.telHome}
                                  onChange={(e) => setQuoteMeta((p) => ({ ...p, telHome: e.target.value }))}
                                />
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center" }}>
                                <span><b>TEL: (WORK)</b></span>
                                <input
                                  className="quote-input"
                                  value={quoteMeta.telWork}
                                  onChange={(e) => setQuoteMeta((p) => ({ ...p, telWork: e.target.value }))}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 4px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center" }}>
                                <span><b>FAX:</b></span>
                                <input
                                  className="quote-input"
                                  value={quoteMeta.fax}
                                  onChange={(e) => setQuoteMeta((p) => ({ ...p, fax: e.target.value }))}
                                />
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center" }}>
                                <span><b>CELL:</b></span>
                                <input
                                  className="quote-input"
                                  value={quoteMeta.cell}
                                  onChange={(e) => setQuoteMeta((p) => ({ ...p, cell: e.target.value }))}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 4px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "145px 1fr", alignItems: "center" }}>
                              <span><b>E-MAIL:</b></span>
                              <input
                                className="quote-input"
                                value={quoteMeta.email}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, email: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 18 }}>
                          <td style={{ padding: "2px 4px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "145px 1fr", alignItems: "center" }}>
                                <span><b>CUSTOMER VAT NO:</b></span>
                                <input
                                  className="quote-input"
                                  value={quoteMeta.vatNo}
                                  onChange={(e) => setQuoteMeta((p) => ({ ...p, vatNo: e.target.value }))}
                                />
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", alignItems: "center" }}>
                                <span><b>O/NO:</b></span>
                                <input
                                  className="quote-input"
                                  value={quoteMeta.orderNo}
                                  onChange={(e) => setQuoteMeta((p) => ({ ...p, orderNo: e.target.value }))}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  <td style={{ width: "20%", verticalAlign: "top", padding: 0 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, height: "100%" }}>
                      <tbody>
                        <tr style={{ height: 18 }}>
                          <td
                            style={{
                              borderBottom: "1px solid #000",
                              padding: "2px 3px",
                              textAlign: "center",
                              fontWeight: 700,
                            }}
                          >
                            QUOTATION
                          </td>
                        </tr>

                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center" }}>
                              <span style={{ textAlign: "left" }}>Quote No:</span>
                              <input
                                className="quote-input quote-input-center"
                                style={{ color: "#c00000" }}
                                value={quoteMeta.quoteNo}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, quoteNo: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>

                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center" }}>
                              <span style={{ textAlign: "left" }}>SALESPERSON:</span>
                              <input
                                className="quote-input quote-input-center"
                                value={quoteMeta.salesperson}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, salesperson: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>

                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center" }}>
                              <span style={{ textAlign: "left" }}>DATE:</span>
                              <input
                                className="quote-input quote-input-center"
                                value={quoteMeta.date}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, date: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>

                        <tr style={{ height: 18 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "2px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center" }}>
                              <span style={{ textAlign: "left" }}>CONTACT PERSON:</span>
                              <input
                                className="quote-input quote-input-center"
                                value={quoteMeta.contactPerson}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, contactPerson: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>

                        <tr style={{ height: 18 }}>
                          <td style={{ padding: "2px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "center" }}>
                              <span style={{ textAlign: "left" }}>INTERNAL ORDER No:</span>
                              <input
                                className="quote-input quote-input-center"
                                value={quoteMeta.internalOrderNo}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, internalOrderNo: e.target.value }))}
                              />
                            </div>
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
              cellPadding={4}
              style={{
                width: "100%",
                marginTop: 2,
                borderCollapse: "collapse",
                fontSize: 10.5,
                border: "2px solid #000",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>LOCATION</th>
                  <th style={{ textAlign: "center" }}>WIDTH mm</th>
                  <th style={{ textAlign: "center" }}>DROP mm</th>
                  <th style={{ textAlign: "center" }}>TYPE OF BLIND</th>
                  <th style={{ textAlign: "center" }}>FABRIC</th>
                  <th style={{ textAlign: "center" }}>COLOUR</th>
                  <th style={{ textAlign: "center" }}>SLAT WIDTH</th>
                  <th style={{ textAlign: "center" }}>FIXTURE</th>
                  <th style={{ textAlign: "center" }}>CONT/STACK</th>
                  <th style={{ textAlign: "center" }}>CONT/LENGTH</th>
                  <th style={{ textAlign: "center" }}>REMARKS</th>
                  <th style={{ textAlign: "right" }}>PRICE</th>
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
                    <td>{displayValue(item.slat)}</td>
                    <td>{displayValue(item.fixture)}</td>
                    <td>{displayValue(item.control)}</td>
                    <td>{displayValue(item.control)}</td>
                    <td>{displayValue(item.remarks)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {item.pending ? "-" : item.custom ? "-" : item.price ? `R ${currency(item.price)}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 6,
                border: "2px solid #000",
                tableLayout: "fixed",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ width: "12%", borderRight: "1px solid #000", padding: "3px 5px", fontWeight: 700, fontSize: 10 }}>
                    SUPPLY ONLY
                  </td>
                  <td style={{ width: "14%", borderRight: "1px solid #000", padding: "3px 5px", fontWeight: 700, fontSize: 10 }}>
                    SUPPLY AND INSTALL
                  </td>
                  <td style={{ width: "13%", borderRight: "1px solid #000", padding: "3px 5px", fontWeight: 700, fontSize: 10 }}>
                    DELIVERY PERIOD
                  </td>
                  <td style={{ width: "6%", borderRight: "1px solid #000", padding: "3px 5px" }} />
                  <td style={{ padding: "3px 5px", fontWeight: 700, fontSize: 10 }}>
                    WORKING DAYS FROM CONFIRMATION
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                borderLeft: "2px solid #000",
                borderRight: "2px solid #000",
                borderBottom: "1px solid #000",
                color: "red",
                textAlign: "center",
                fontWeight: 700,
                padding: "3px 6px",
                fontSize: 9,
                lineHeight: "11px",
              }}
            >
              PRICES QUOTED ARE SUBJECT TO VARIATION SHOULD THE ABOVE DIFFER IN PRODUCT, DESIGN OR SIZE
            </div>

            <div style={{ display: "flex", gap: 0 }}>
              <div
                style={{
                  flex: 1.08,
                  borderLeft: "2px solid #000",
                  borderRight: "1px solid #000",
                  borderBottom: "2px solid #000",
                  background: "#fff",
                }}
              >
                <div style={{ padding: "2px 6px", borderBottom: "1px solid #000", fontWeight: 700, textAlign: "center", fontSize: 10 }}>
                  FIRST NATIONAL BANK
                </div>

                <div style={{ padding: "2px 6px", textAlign: "center", lineHeight: "15px", fontSize: 9.8 }}>
                  <div><b>Branch:</b> 221325</div>
                  <div><b>Acc:</b> 62180140156</div>
                  <div><b>Name:</b> Venetian Blind Centre</div>
                  <div>
                    <b>REFERENCE:</b>{" "}
                    <span style={{ color: "#c00000" }}>{referenceValue}</span>
                  </div>
                </div>

                <div
                  style={{
                    background: "#000",
                    color: "#fff",
                    textAlign: "center",
                    padding: "4px 4px",
                    marginTop: 2,
                    lineHeight: "13px",
                    fontSize: 9,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>PAYMENT TERMS</div>
                  <div>AN 80% DEPOSIT ON CONFIRMATION.</div>
                  <div>BALANCE TO BE SETTLED IN FULL BEFORE</div>
                  <div>INSTALLATION OR COLLECTION</div>
                </div>
              </div>

              <div
                style={{
                  flex: 1.12,
                  borderRight: "1px solid #000",
                  borderBottom: "2px solid #000",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "2px 6px", fontWeight: 700, borderBottom: "1px solid #000" }}>
                        CUSTOMER CONFIRMATION
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 6px", borderBottom: "1px solid #000" }}>
                        <span style={{ fontWeight: 700 }}>NAME:</span> ______________________
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 6px", borderBottom: "1px solid #000" }}>
                        <span style={{ fontWeight: 700 }}>DATE:</span> ______________________
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 6px" }}>
                        <span style={{ fontWeight: 700 }}>SIGNATURE:</span> ________________
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  flex: 2.55,
                  borderRight: "1px solid #000",
                  borderBottom: "2px solid #000",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.4 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "2px 6px", fontWeight: 700, verticalAlign: "top" }}>
                        PLEASE NOTE THE FOLLOWING:-
                      </td>
                      <td style={{ padding: "2px 6px", fontWeight: 700, textAlign: "center", verticalAlign: "top", width: 150 }}>
                        QUOTE VALID FOR 7 DAYS
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: "1px 6px", lineHeight: "14px" }}>
                        <div>All wood and bamboo blinds will be subject to imperfections, warpage & colour variations inherent in natural wood.</div>
                        <div>We are not responsible for any damage whilst drilling through wall, brick, tile, granite & marble during installation.</div>
                        <div>All awnings and outdoor blinds installed are not guaranteed against storm damage.</div>
                        <div>For security measures all cash payments to be made instore.</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  flex: 0.95,
                  borderRight: "2px solid #000",
                  borderBottom: "2px solid #000",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "2px 6px", borderBottom: "1px solid #000" }}>SUBTOTAL</td>
                      <td style={{ padding: "2px 6px", borderBottom: "1px solid #000", textAlign: "right" }}>R {currency(subtotal)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 6px", borderBottom: "1px solid #000" }}>DISCOUNT</td>
                      <td style={{ padding: "2px 6px", borderBottom: "1px solid #000", textAlign: "right" }}>R 0.00</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "4px 6px" }}></td>
                      <td style={{ padding: "4px 6px" }}></td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 6px", borderTop: "1px solid #000", fontWeight: 700 }}>SUBTOTAL</td>
                      <td style={{ padding: "2px 6px", borderTop: "1px solid #000", textAlign: "right", fontWeight: 700 }}>
                        R {currency(subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 6px" }}>VAT</td>
                      <td style={{ padding: "2px 6px", textAlign: "right" }}>R {currency(vat)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 6px", fontWeight: 700 }}>TOTAL</td>
                      <td style={{ padding: "2px 6px", textAlign: "right", fontWeight: 700 }}>
                        R {currency(grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
