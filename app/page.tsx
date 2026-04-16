"use client";

import React, { useMemo, useState } from "react";

type ControlSide = "Left" | "Right";
type ClearWindow = "Yes" | "No";

type Item = {
  id: string;
  area: string;
  product: string;
  widthM: number | "";
  dropM: number | "";
  qty: number;
  controlSide: ControlSide;
  clearWindow: ClearWindow;
};

type ComputedItem = Item & {
  unit: number;
  total: number;
  pending?: boolean;
  custom?: boolean;
};

const WIDTH_STEPS_MM = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500];
const DROP_STEPS_MM = [1000, 1500, 2000, 2500, 3000, 3500];

const BASE_PRICE_GRID: Record<number, Record<number, number>> = {
  1000: { 1000: 1566, 1500: 1851, 2000: 2136, 2500: 2421, 3000: 2706, 3500: 2991, 4000: 3276, 4500: 3561, 5000: 3846, 5500: 4131 },
  1500: { 1000: 1746, 1500: 2091, 2000: 2436, 2500: 2781, 3000: 3126, 3500: 3471, 4000: 3816, 4500: 4161, 5000: 4506, 5500: 4851 },
  2000: { 1000: 1926, 1500: 2331, 2000: 2736, 2500: 3141, 3000: 3546, 3500: 3951, 4000: 4356, 4500: 4761, 5000: 5166, 5500: 5571 },
  2500: { 1000: 2106, 1500: 2571, 2000: 3036, 2500: 3501, 3000: 3966, 3500: 4431, 4000: 4896, 4500: 5361, 5000: 5826, 5500: 6291 },
  3000: { 1000: 2286, 1500: 2811, 2000: 3336, 2500: 3861, 3000: 4386, 3500: 4911, 4000: 5436, 4500: 5961, 5000: 6486, 5500: 7011 },
  3500: { 1000: 2466, 1500: 3051, 2000: 3636, 2500: 4221, 3000: 4806, 3500: 5391, 4000: 5976, 4500: 6561, 5000: 7146, 5500: 7731 },
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

export default function Page() {
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      area: "",
      product: "Outdoor Drop Blind",
      widthM: "",
      dropM: "",
      qty: 1,
      controlSide: "Left",
      clearWindow: "No",
    },
  ]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        area: "",
        product: "Outdoor Drop Blind",
        widthM: "",
        dropM: "",
        qty: 1,
        controlSide: "Left",
        clearWindow: "No",
      },
    ]);
  };

  const updateItem = <K extends keyof Item>(id: string, field: K, value: Item[K]) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const computed: ComputedItem[] = useMemo(() => {
    return items.map((item) => {
      if (item.widthM === "" || item.dropM === "") {
        return { ...item, unit: 0, total: 0, pending: true };
      }

      const widthMm = Math.ceil(Number(item.widthM) * 1000);
      const dropMm = Math.ceil(Number(item.dropM) * 1000);

      const roundedWidth = roundUp(widthMm, WIDTH_STEPS_MM);
      const roundedDrop = roundUp(dropMm, DROP_STEPS_MM);

      if (!roundedWidth || !roundedDrop) {
        return { ...item, unit: 0, total: 0, custom: true };
      }

      const base = BASE_PRICE_GRID[roundedDrop][roundedWidth];
      const addon = item.clearWindow === "Yes" ? CLEAR_WINDOW_ADDON[roundedWidth] : 0;

      const unit = base + addon;
      const total = unit * item.qty;

      return { ...item, unit, total };
    });
  }, [items]);

  const totals = useMemo(() => {
    const sub = computed.reduce((sum, item) => sum + item.total, 0);
    const vat = sub * VAT_RATE;
    return {
      sub,
      vat,
      total: sub + vat,
    };
  }, [computed]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Luvaflex Quote App</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Enter sizes in metres. Pricing runs in the background using rounded grid sizes.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table
          border={1}
          cellPadding={8}
          style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Area</th>
              <th>Product</th>
              <th>Width (m)</th>
              <th>Drop (m)</th>
              <th>Window</th>
              <th>Control Side</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {computed.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    value={item.area}
                    onChange={(e) => updateItem(item.id, "area", e.target.value)}
                  />
                </td>

                <td>{item.product}</td>

                <td>
                  <input
                    type="number"
                    step="0.001"
                    value={item.widthM}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "widthM",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    step="0.001"
                    value={item.dropM}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "dropM",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td>
                  <select
                    value={item.clearWindow}
                    onChange={(e) =>
                      updateItem(item.id, "clearWindow", e.target.value as ClearWindow)
                    }
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </td>

                <td>
                  <select
                    value={item.controlSide}
                    onChange={(e) =>
                      updateItem(item.id, "controlSide", e.target.value as ControlSide)
                    }
                  >
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                  </select>
                </td>

                <td>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(item.id, "qty", Math.max(0, Number(e.target.value) || 0))
                    }
                    style={{ width: 60 }}
                  />
                </td>

                <td>
                  {item.pending ? (
                    "-"
                  ) : item.custom ? (
                    <span style={{ color: "red", fontWeight: 600 }}>Custom Quote</span>
                  ) : (
                    currency(item.unit)
                  )}
                </td>

                <td>
                  {item.pending ? (
                    "-"
                  ) : item.custom ? (
                    "-"
                  ) : (
                    currency(item.total)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addItem} style={{ marginTop: 20 }}>
        Add Item
      </button>

      <div style={{ marginTop: 30 }}>
        <p>Subtotal: {currency(totals.sub)}</p>
        <p>VAT: {currency(totals.vat)}</p>
        <h2>Total: {currency(totals.total)}</h2>
      </div>
    </div>
  );
}
