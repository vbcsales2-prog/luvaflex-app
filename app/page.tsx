"use client";

import React, { useMemo, useState } from "react";

/* ================= TYPES ================= */

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

/* ================= MAIN ================= */

export default function Page() {
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
      manualPrice: 0,
      editingPrice: false,
    },
  ]);

  const update = (id: string, field: keyof Item, value: any) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
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
        manualPrice: 0,
        editingPrice: false,
      },
    ]);
  };

  const subtotal = items.reduce((sum, i) => sum + (i.manualPrice || 0), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  /* ================= UI ================= */

  return (
    <div style={{ padding: 6, fontFamily: "Arial" }}>
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 3mm;
          }

          body {
            margin: 0;
          }

          .no-print {
            display: none;
          }

          .print {
            transform: scale(0.95);
            transform-origin: top left;
            width: 105%;
          }
        }

        table {
          border-collapse: collapse;
        }

        td, th {
          border: 1px solid #000;
          padding: 2px 4px;
          font-size: 10px;
        }

        input {
          border: none;
          width: 100%;
          font-size: 10px;
        }
      `}</style>

      {/* ================= APP TABLE ================= */}

      <div className="no-print">
        <h3>Luvaflex Quote</h3>

        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Area</th>
              <th>Width</th>
              <th>Drop</th>
              <th>Type</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  <input
                    value={i.area}
                    onChange={(e) => update(i.id, "area", e.target.value)}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={i.width}
                    onChange={(e) =>
                      update(i.id, "width", Number(e.target.value))
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={i.drop}
                    onChange={(e) =>
                      update(i.id, "drop", Number(e.target.value))
                    }
                  />
                </td>

                <td>
                  <input
                    value={i.type}
                    onChange={(e) => update(i.id, "type", e.target.value)}
                  />
                </td>

                <td>
                  {i.editingPrice ? (
                    <input
                      type="number"
                      value={i.manualPrice}
                      onChange={(e) =>
                        update(i.id, "manualPrice", Number(e.target.value))
                      }
                      onBlur={() => update(i.id, "editingPrice", false)}
                    />
                  ) : (
                    <span
                      onClick={() => update(i.id, "editingPrice", true)}
                      style={{ cursor: "pointer", color: "blue" }}
                    >
                      {i.manualPrice?.toFixed(2)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addItem}>Add</button>
      </div>

      {/* ================= PRINT ================= */}

      <div className="print">
        <table style={{ width: "100%", marginTop: 10 }}>
          <tbody>
            <tr>
              <td style={{ width: "35%" }}>
                <b>Venetian Blind Centre</b>
                <br />
                442 Greyling Street
                <br />
                Pietermaritzburg
              </td>

              <td style={{ width: "45%" }}>
                <b>INVOICE TO:</b>
                <input />
                <br />
                <b>ADDRESS:</b>
                <input />
              </td>

              <td style={{ width: "20%" }}>
                <b>QUOTATION</b>
                <br />
                <input placeholder="Quote No" />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ITEMS */}

        <table style={{ width: "100%", marginTop: 5 }}>
          <thead>
            <tr>
              <th>LOCATION</th>
              <th>WIDTH</th>
              <th>DROP</th>
              <th>TYPE</th>
              <th>PRICE</th>
            </tr>
          </thead>

          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.area}</td>
                <td>{i.width}</td>
                <td>{i.drop}</td>
                <td>{i.type}</td>
                <td>R {i.manualPrice?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FOOTER */}

        <table style={{ width: "100%", marginTop: 5 }}>
          <tbody>
            <tr>
              <td style={{ width: "70%" }}>
                Prices subject to change
              </td>

              <td style={{ width: "30%" }}>
                Subtotal: R {subtotal.toFixed(2)}
                <br />
                VAT: R {vat.toFixed(2)}
                <br />
                Total: R {total.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
