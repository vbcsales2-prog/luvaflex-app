"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  controlLength: string;
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

type OutdoorPricing = {
  gridStepMm: number;
  maxWidthMm: number;
  maxDropMm: number;
  defaultMarkup: number;
  fabricPerSqm: number;
  standardCostPerBlind: number;
  topBarPerM: number;
  bottomPolePerM: number;
  cordPerM: number;
  valancePerSqm: number;
  clearWindowPerSqm: number;
  clearWindowReferenceDropM: number;
};

const DEFAULT_OUTDOOR_PRICING: OutdoorPricing = {
  gridStepMm: 500,
  maxWidthMm: 6000,
  maxDropMm: 3500,
  defaultMarkup: 0,
  fabricPerSqm: 130,
  standardCostPerBlind: 924,
  topBarPerM: 200,
  bottomPolePerM: 200,
  cordPerM: 20,
  valancePerSqm: 120,
  clearWindowPerSqm: 300,
  clearWindowReferenceDropM: 1.5,
};

const VAT_RATE = 0.15;

function roundUp(value: number, steps: number[]): number | null {
  for (const step of steps) {
    if (value <= step) return step;
  }
  return null;
}

function roundUpToStep(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

function getOutdoorBasePrice(widthMm: number, dropMm: number, pricing: OutdoorPricing): number {
  const widthM = widthMm / 1000;
  const dropM = dropMm / 1000;
  const area = widthM * dropM;
  const topAndBottomLength = widthM;
  const cordLength = dropM * 6 + widthM;

  return (
    area * pricing.fabricPerSqm +
    pricing.standardCostPerBlind +
    topAndBottomLength * pricing.topBarPerM +
    topAndBottomLength * pricing.bottomPolePerM +
    cordLength * pricing.cordPerM +
    area * pricing.valancePerSqm
  );
}

function getOutdoorClearWindowAddon(widthMm: number, pricing: OutdoorPricing): number {
  const widthM = widthMm / 1000;
  return widthM * pricing.clearWindowReferenceDropM * pricing.clearWindowPerSqm;
}



function getOutdoorGridSteps(maxMm: number, stepMm: number): number[] {
  const steps: number[] = [];
  for (let value = stepMm * 2; value <= maxMm; value += stepMm) {
    steps.push(value);
  }
  return steps;
}

function pricingFieldLabel(field: keyof OutdoorPricing): string {
  const labels: Record<keyof OutdoorPricing, string> = {
    gridStepMm: "Grid step (mm)",
    maxWidthMm: "Max width (mm)",
    maxDropMm: "Max drop (mm)",
    defaultMarkup: "Markup (%)",
    fabricPerSqm: "Fabric / m²",
    standardCostPerBlind: "Standard cost / blind",
    topBarPerM: "Top bar / m",
    bottomPolePerM: "Bottom pole / m",
    cordPerM: "6mm cord / m",
    valancePerSqm: "Valance / m²",
    clearWindowPerSqm: "Clear window / m²",
    clearWindowReferenceDropM: "Window ref drop (m)",
  };

  return labels[field];
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
  if (["Outdoor", "Venetian", "Roller", "Roman", "Lumi Cell", "Lumi Plisse", "Doppio", "Zebra"].includes(type)) {
    return ["RHC", "LHC"];
  }
  return [];
}

function getControlMode(type: BlindType): "dropdown" | "manual" {
  return getControlOptions(type).length > 0 ? "dropdown" : "manual";
}

function getSlatMode(type: BlindType): "venetian" | "vertical" | "na" | "manual" {
  if (type === "Venetian") return "venetian";
  if (verticalFamily.includes(type)) return "vertical";
  if (["Outdoor", "Roller", "Roman"].includes(type)) return "na";
  if (["Lumi Cell", "Lumi Plisse", "Doppio", "Zebra"].includes(type)) return "manual";
  return "manual";
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

  const [showPricingPanel, setShowPricingPanel] = useState(false);
  const [outdoorPricing, setOutdoorPricing] = useState<OutdoorPricing>(DEFAULT_OUTDOOR_PRICING);

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
      controlLength: "",
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
        controlLength: "",
        remarks: "",
        manualPrice: undefined,
        editingPrice: false,
      },
    ]);
  };



  useEffect(() => {
    const savedPricing = window.localStorage.getItem("luvaflex-outdoor-pricing");
    if (!savedPricing) return;

    try {
      const parsed = JSON.parse(savedPricing) as Partial<OutdoorPricing>;
      setOutdoorPricing((prev) => ({ ...prev, ...parsed }));
    } catch (error) {
      console.error("Failed to load outdoor pricing", error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("luvaflex-outdoor-pricing", JSON.stringify(outdoorPricing));
  }, [outdoorPricing]);

  const updateOutdoorPricing = (field: keyof OutdoorPricing, value: number) => {
    setOutdoorPricing((prev) => ({
      ...prev,
      [field]: field === "defaultMarkup" ? value / 100 : value,
    }));
  };

  const resetOutdoorPricing = () => {
    setOutdoorPricing(DEFAULT_OUTDOOR_PRICING);
    window.localStorage.removeItem("luvaflex-outdoor-pricing");
  };

  const outdoorWidthStepsMm = useMemo(
    () => getOutdoorGridSteps(outdoorPricing.maxWidthMm, outdoorPricing.gridStepMm),
    [outdoorPricing.maxWidthMm, outdoorPricing.gridStepMm]
  );

  const outdoorDropStepsMm = useMemo(
    () => getOutdoorGridSteps(outdoorPricing.maxDropMm, outdoorPricing.gridStepMm),
    [outdoorPricing.maxDropMm, outdoorPricing.gridStepMm]
  );

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

          const roundedWidth = roundUpToStep(widthMm, outdoorPricing.gridStepMm);
          const roundedDrop = roundUpToStep(dropMm, outdoorPricing.gridStepMm);

          if (
            roundedWidth > outdoorPricing.maxWidthMm ||
            roundedDrop > outdoorPricing.maxDropMm
          ) {
            custom = true;
          } else {
            const base = getOutdoorBasePrice(roundedWidth, roundedDrop, outdoorPricing);
            const addon =
              item.remarks === "With Window" ? getOutdoorClearWindowAddon(roundedWidth, outdoorPricing) : 0;

            price = (base + addon) * (1 + outdoorPricing.defaultMarkup);
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
  }, [items, outdoorPricing]);

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
          line-height: 1.1;
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
            margin: 3mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
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
            transform: scale(0.985);
            transform-origin: top left;
            width: 101.6%;
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

          <div
            style={{
              border: "2px solid #000",
              padding: 10,
              marginBottom: 12,
              background: "#f8f8f8",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 16 }}>Outdoor price maintenance</h2>
                <p style={{ margin: "4px 0 0 0", fontSize: 12 }}>
                  Change supplier values here whenever pricing moves again. These values save in this browser.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setShowPricingPanel((prev) => !prev)}>
                  {showPricingPanel ? "Hide settings" : "Show settings"}
                </button>
                <button type="button" onClick={resetOutdoorPricing}>
                  Reset to latest workbook values
                </button>
              </div>
            </div>

            {showPricingPanel && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {(Object.keys(DEFAULT_OUTDOOR_PRICING) as Array<keyof OutdoorPricing>).map((field) => (
                    <label
                      key={field}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        fontSize: 12,
                      }}
                    >
                      <span>{pricingFieldLabel(field)}</span>
                      <input
                        type="number"
                        step={field === "defaultMarkup" ? "0.1" : "0.01"}
                        value={field === "defaultMarkup" ? outdoorPricing[field] * 100 : outdoorPricing[field]}
                        onChange={(e) => updateOutdoorPricing(field, Number(e.target.value || 0))}
                      />
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12 }}>
                  <div>Width steps: {outdoorWidthStepsMm.map((value) => value / 1000).join("m, ")}m</div>
                  <div>Drop steps: {outdoorDropStepsMm.map((value) => value / 1000).join("m, ")}m</div>
                </div>
              </>
            )}
          </div>


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
                <th>Cont/Stack</th>
                <th>Cont/Length</th>
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
                        update(item.id, "controlLength", "");
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
                    ) : getSlatMode(item.type) === "na" ? (
                      <input value="N/A" readOnly style={{ width: "100%", background: "#f3f3f3" }} />
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
                    {item.type === "" || getControlMode(item.type) === "manual" ? (
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
                    <input
                      value={item.controlLength}
                      onChange={(e) => update(item.id, "controlLength", e.target.value)}
                      style={{ width: "100%" }}
                    />
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
                        value={item.manualPrice ?? ""}
                        onChange={(e) =>
                          update(
                            item.id,
                            "manualPrice",
                            e.target.value === "" ? undefined : Number(e.target.value)
                          )
                        }
                        onBlur={() => update(item.id, "editingPrice", false)}
                        autoFocus
                        style={{ width: "100%", textAlign: "right" }}
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

        <div className="print-only-quote print-scale" style={{ marginTop: 4 }}>
          <div
            style={{
              padding: 3,
              border: "2px solid #000",
              background: "#fff",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "2px solid #000",
                marginBottom: 2,
                tableLayout: "fixed",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "35%",
                      borderRight: "2px solid #000",
                      padding: "1px 3px",
                      verticalAlign: "top",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      <img
                        src="/logo.png"
                        alt="Venetian Blind Centre"
                        style={{
                          width: "100%",
                          maxWidth: 405,
                          height: "auto",
                          display: "block",
                          marginBottom: 2,
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            marginTop: 0,
                            fontSize: 8.8,
                            lineHeight: "10.1px",
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
                            width: 98,
                            border: "1px solid #000",
                            padding: "3px 3px",
                            fontSize: 7.4,
                            lineHeight: "9.2px",
                            textAlign: "center",
                            marginTop: 4,
                            marginRight: 1,
                          }}
                        >
                          <div><b>MONDAY TO FRIDAY -</b></div>
                          <div><b>7:30am TO 4:30pm</b></div>
                          <div style={{ marginTop: 1 }}><b>CLOSED FRIDAYS BETWEEN</b></div>
                          <div><b>11:30 & 2pm</b></div>
                          <div style={{ marginTop: 1 }}><b>SATURDAY - 7:30am TO 12:30pm</b></div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td
                    style={{
                      width: "50%",
                      borderRight: "2px solid #000",
                      verticalAlign: "top",
                      padding: 0,
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.9, height: "100%" }}>
                      <tbody>
                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", alignItems: "center" }}>
                              <span><b>INVOICE TO / NAME:</b></span>
                              <input
                                className="quote-input"
                                value={quoteMeta.invoiceName}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, invoiceName: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", alignItems: "center" }}>
                              <span><b>ADDRESS:</b></span>
                              <input
                                className="quote-input"
                                value={quoteMeta.address}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, address: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", alignItems: "center" }}>
                              <span><b>POSTAL ADDRESS:</b></span>
                              <input
                                className="quote-input"
                                value={quoteMeta.postalAddress}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, postalAddress: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, alignItems: "center" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", alignItems: "center" }}>
                                <span><b>TEL: (HOME)</b></span>
                                <input
                                  className="quote-input"
                                  value={quoteMeta.telHome}
                                  onChange={(e) => setQuoteMeta((p) => ({ ...p, telHome: e.target.value }))}
                                />
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", alignItems: "center" }}>
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
                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, alignItems: "center" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", alignItems: "center" }}>
                                <span><b>FAX:</b></span>
                                <input
                                  className="quote-input"
                                  value={quoteMeta.fax}
                                  onChange={(e) => setQuoteMeta((p) => ({ ...p, fax: e.target.value }))}
                                />
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", alignItems: "center" }}>
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
                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", alignItems: "center" }}>
                              <span><b>E-MAIL:</b></span>
                              <input
                                className="quote-input"
                                value={quoteMeta.email}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, email: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>
                        <tr style={{ height: 12 }}>
                          <td style={{ padding: "1px 3px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, alignItems: "center" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", alignItems: "center" }}>
                                <span><b>CUSTOMER VAT NO:</b></span>
                                <input
                                  className="quote-input"
                                  value={quoteMeta.vatNo}
                                  onChange={(e) => setQuoteMeta((p) => ({ ...p, vatNo: e.target.value }))}
                                />
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", alignItems: "center" }}>
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

                  <td style={{ width: "15%", verticalAlign: "top", padding: 0 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.9, height: "100%" }}>
                      <tbody>
                        <tr style={{ height: 12 }}>
                          <td
                            style={{
                              borderBottom: "1px solid #000",
                              padding: "1px 3px",
                              textAlign: "center",
                              fontWeight: 700,
                            }}
                          >
                            QUOTATION
                          </td>
                        </tr>

                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "66px 1fr", alignItems: "center" }}>
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

                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "66px 1fr", alignItems: "center" }}>
                              <span style={{ textAlign: "left" }}>SALESPERSON:</span>
                              <input
                                className="quote-input quote-input-center"
                                value={quoteMeta.salesperson}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, salesperson: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>

                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "66px 1fr", alignItems: "center" }}>
                              <span style={{ textAlign: "left" }}>DATE:</span>
                              <input
                                className="quote-input quote-input-center"
                                value={quoteMeta.date}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, date: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>

                        <tr style={{ height: 12 }}>
                          <td style={{ borderBottom: "1px solid #000", padding: "1px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "66px 1fr", alignItems: "center" }}>
                              <span style={{ textAlign: "left" }}>CONTACT PERSON:</span>
                              <input
                                className="quote-input quote-input-center"
                                value={quoteMeta.contactPerson}
                                onChange={(e) => setQuoteMeta((p) => ({ ...p, contactPerson: e.target.value }))}
                              />
                            </div>
                          </td>
                        </tr>

                        <tr style={{ height: 12 }}>
                          <td style={{ padding: "1px 3px", textAlign: "center" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "66px 1fr", alignItems: "center" }}>
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
              cellPadding={2}
              style={{
                width: "100%",
                marginTop: 2,
                borderCollapse: "collapse",
                fontSize: 8.6,
                border: "2px solid #000",
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>LOCATION</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>WIDTH m</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>DROP m</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>TYPE OF BLIND</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>FABRIC</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>COLOUR</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>SLAT WIDTH</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>FIXTURE</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>CONT/STACK</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>CONT/LENGTH</th>
                  <th style={{ textAlign: "center", padding: "1px 2px" }}>REMARKS</th>
                  <th style={{ textAlign: "right", padding: "1px 2px" }}>PRICE</th>
                </tr>
              </thead>

              <tbody>
                {computed.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.area)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.width)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.drop)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.type)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.fabric)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.colour)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.slat)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.fixture)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.control)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.controlLength)}</td>
                    <td style={{ padding: "1px 2px" }}>{displayValue(item.remarks)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, padding: "1px 2px" }}>
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
                marginTop: 4,
                border: "2px solid #000",
                tableLayout: "fixed",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ width: "12%", borderRight: "1px solid #000", padding: "1px 3px", fontWeight: 700, fontSize: 8.5 }}>
                    SUPPLY ONLY
                  </td>
                  <td style={{ width: "14%", borderRight: "1px solid #000", padding: "1px 3px", fontWeight: 700, fontSize: 8.5 }}>
                    SUPPLY AND INSTALL
                  </td>
                  <td style={{ width: "13%", borderRight: "1px solid #000", padding: "1px 3px", fontWeight: 700, fontSize: 8.5 }}>
                    DELIVERY PERIOD
                  </td>
                  <td style={{ width: "6%", borderRight: "1px solid #000", padding: "1px 3px" }} />
                  <td style={{ padding: "1px 3px", fontWeight: 700, fontSize: 8.5 }}>
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
                padding: "1px 4px",
                fontSize: 7.4,
                lineHeight: "9.6px",
              }}
            >
              PRICES QUOTED ARE SUBJECT TO VARIATION SHOULD THE ABOVE DIFFER IN PRODUCT, DESIGN OR SIZE
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "19% 20% 44% 17%" }}>
              <div
                style={{
                  width: "100%",
                  borderLeft: "2px solid #000",
                  borderRight: "1px solid #000",
                  borderBottom: "2px solid #000",
                  background: "#fff",
                }}
              >
                <div style={{ padding: "2px 5px", borderBottom: "1px solid #000", fontWeight: 700, textAlign: "center", fontSize: 8.1 }}>
                  FIRST NATIONAL BANK
                </div>

                <div style={{ padding: "2px 5px", textAlign: "center", lineHeight: "10.2px", fontSize: 8.1 }}>
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
                    padding: "2px 3px",
                    marginTop: 0,
                    lineHeight: "10px",
                    fontSize: 7.5,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 1 }}>PAYMENT TERMS</div>
                  <div>AN 80% DEPOSIT ON CONFIRMATION.</div>
                  <div>BALANCE TO BE SETTLED IN FULL BEFORE</div>
                  <div>INSTALLATION OR COLLECTION</div>
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  borderRight: "1px solid #000",
                  borderBottom: "2px solid #000",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.5 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "2px 5px", fontWeight: 700, borderBottom: "1px solid #000" }}>
                        CUSTOMER CONFIRMATION
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 5px", borderBottom: "1px solid #000" }}>
                        <span style={{ fontWeight: 700 }}>NAME:</span> ______________________
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 5px", borderBottom: "1px solid #000" }}>
                        <span style={{ fontWeight: 700 }}>DATE:</span> ______________________
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 5px" }}>
                        <span style={{ fontWeight: 700 }}>SIGNATURE:</span> ________________
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  width: "100%",
                  borderRight: "1px solid #000",
                  borderBottom: "2px solid #000",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 7.9 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "2px 5px", fontWeight: 700, verticalAlign: "top" }}>
                        PLEASE NOTE THE FOLLOWING:-
                      </td>
                      <td style={{ padding: "2px 5px", fontWeight: 700, textAlign: "center", verticalAlign: "top", width: 112 }}>
                        QUOTE VALID FOR 7 DAYS
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} style={{ padding: "1px 5px", lineHeight: "10px" }}>
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
                  width: "100%",
                  borderRight: "2px solid #000",
                  borderBottom: "2px solid #000",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8.5 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "2px 5px", borderBottom: "1px solid #000" }}>SUBTOTAL</td>
                      <td style={{ padding: "2px 5px", borderBottom: "1px solid #000", textAlign: "right" }}>
                        R {currency(subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 5px", borderBottom: "1px solid #000" }}>DISCOUNT</td>
                      <td style={{ padding: "2px 5px", borderBottom: "1px solid #000", textAlign: "right" }}>R 0.00</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 5px" }}></td>
                      <td style={{ padding: "2px 5px" }}></td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 5px", borderTop: "1px solid #000", fontWeight: 700 }}>
                        SUBTOTAL
                      </td>
                      <td
                        style={{
                          padding: "2px 5px",
                          borderTop: "1px solid #000",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        R {currency(subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 5px" }}>VAT</td>
                      <td style={{ padding: "2px 5px", textAlign: "right" }}>R {currency(vat)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "2px 5px", fontWeight: 700 }}>TOTAL</td>
                      <td style={{ padding: "2px 5px", textAlign: "right", fontWeight: 700 }}>
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
