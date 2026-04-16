"use client";

import React, { useMemo, useState } from "react";

type Item = {
  id: string;
  room: string;
  product: string;
  widthMm: number | "";
  dropMm: number | "";
  qty: number;
  controlSide: "Left" | "Right";
  clearWindow: "Yes" | "No";
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

function roundUpToGrid(valueMm: number, steps: number[]) {
  for (const step of steps) {
    if (valueMm <= step) return step;
  }
  return null;
}

function currency(value: number) {
  return value.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Page() {
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      room: "",
      product: "Outdoor Drop Blind",
      widthMm: "",
      dropMm: "",
      qty: 1,
      controlSide: "Left",
      clearWindow: "No",
    },
  ]);

  const [extraMarkupPercent, setExtraMarkupPercent] = useState<number>(0);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        room: "",
        product: "Outdoor Drop Blind",
        widthMm: "",
        dropMm: "",
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

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const computedItems = useMemo(() => {
    return items.map((item) => {
      const hasSizes =
        item.widthMm !== "" &&
        item.dropMm !== "" &&
        Number(item.widthMm) > 0 &&
        Number(item.dropMm) > 0;

      if (!hasSizes) {
        return {
          ...item,
          roundedWidth: null,
          roundedDrop: null,
          outsideGrid: false,
          basePrice: 0,
          clearWindowAddon: 0,
          unitPrice: 0,
          lineTotal: 0,
          pending: true,
        };
      }

      const measuredWidth = Number(item.widthMm);
      const measuredDrop = Number(item.dropMm);

      const roundedWidth = roundUpToGrid(measuredWidth, WIDTH_STEPS_MM);
      const roundedDrop = roundUpToGrid(measuredDrop, DROP_STEPS_MM);

      const outsideGrid = !roundedWidth || !roundedDrop;

      let basePrice = 0;
      let clearWindowAddon = 0;
      let unitPrice = 0;

      if (!outsideGrid && roundedWidth && roundedDrop) {
        basePrice = BASE_PRICE_GRID[roundedDrop][roundedWidth];
        clearWindowAddon =
          item.clearWindow === "Yes" ? CLEAR_WINDOW_ADDON[roundedWidth] ?? 0 : 0;
        unitPrice = (basePrice + clearWindowAddon) * (1 + extraMarkupPercent / 100);
      }

      const lineTotal = unitPrice * Math.max(item.qty || 0, 0);

      return {
        ...item,
        roundedWidth,
        roundedDrop,
        outsideGrid,
        basePrice,
        clearWindowAddon,
        unitPrice,
        lineTotal,
        pending: false,
      };
    });
  }, [items, extraMarkupPercent]);

  const totals = useMemo(() => {
    const subtotal = computedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }, [computedItems]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Luvaflex Quote App</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Measured sizes are shown to the customer. Pricing runs in the background using rounded grid sizes.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 600 }}>
          Extra Markup %{" "}
          <input
            type="number"
            value={extraMarkupPercent}
            onChange={(e) => setExtraMarkupPercent(Number(e.target.value) || 0)}
            style={{ marginLeft: 8, width: 90 }}
          />
        </label>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Room</th>
              <th>Product</th>
              <th>Width (Measured mm)</th>
              <th>Drop (Measured mm)</th>
              <th>Window</th>
              <th>Control Side</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {computedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    value={item.room}
                    onChange={(e) => updateItem(item.id, "room", e.target.value)}
                  />
                </td>

                <td>{item.product}</td>

                <td>
                  <input
                    type="number"
                    value={item.widthMm}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "widthMm",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={item.dropMm}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "dropMm",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </td>

                <td>
                  <select
                    value={item.clearWindow}
                    onChange={(e) =>
                      updateItem(item.id, "clearWindow", e.target.value as "Yes" | "No")
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
                      updateItem(item.id, "controlSide", e.target.value as "Left" | "Right")
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
                    onChange={(e) => updateItem(item.id, "qty", Number(e.target.value) || 0)}
                    style={{ width: 60 }}
                  />
                </td>

                <td>
                  {item.pending ? (
                    <span style={{ color: "#777" }}>-</span>
                  ) : item.outsideGrid ? (
                    <span style={{ color: "red", fontWeight: 600 }}>Custom Quote</span>
                  ) : (
                    currency(item.unitPrice)
                  )}
                </td>

                <td>
                  {item.pending ? (
                    <span style={{ color: "#777" }}>-</span>
                  ) : item.outsideGrid ? (
                    <span style={{ color: "red", fontWeight: 600 }}>-</span>
                  ) : (
                    currency(item.lineTotal)
                  )}
                </td>

                <td>
                  <button onClick={() => removeItem(item.id)}>X</button>
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
        <p>Subtotal: {currency(totals.subtotal)}</p>
        <p>VAT (15%): {currency(totals.vat)}</p>
        <h2>Total: {currency(totals.total)}</h2>
      </div>
    </div>
  );
}
