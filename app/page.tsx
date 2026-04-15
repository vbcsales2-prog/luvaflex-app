"use client";

import React, { useMemo, useState } from "react";

type Item = {
  id: string;
  room: string;
  product: string;
  width: number;
  drop: number;
  qty: number;
  unitPrice: number;
};

export default function Page() {
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      room: "",
      product: "Roller Blind",
      width: 0,
      drop: 0,
      qty: 1,
      unitPrice: 0,
    },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        room: "",
        product: "Roller Blind",
        width: 0,
        drop: 0,
        qty: 1,
        unitPrice: 0,
      },
    ]);
  };

  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0
    );
    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    return { subtotal, vat, total };
  }, [items]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Luvaflex Quote App</h1>

      <table border={1} cellPadding={8} style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Room</th>
            <th>Product</th>
            <th>Width (mm)</th>
            <th>Drop (mm)</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  value={item.room}
                  onChange={(e) =>
                    updateItem(item.id, "room", e.target.value)
                  }
                />
              </td>

              <td>
                <select
                  value={item.product}
                  onChange={(e) =>
                    updateItem(item.id, "product", e.target.value)
                  }
                >
                  <option>Roller Blind</option>
                  <option>Outdoor Drop Blind</option>
                  <option>Venetian Blind</option>
                </select>
              </td>

              <td>
                <input
                  type="number"
                  value={item.width}
                  onChange={(e) =>
                    updateItem(item.id, "width", Number(e.target.value))
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.drop}
                  onChange={(e) =>
                    updateItem(item.id, "drop", Number(e.target.value))
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) =>
                    updateItem(item.id, "qty", Number(e.target.value))
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(item.id, "unitPrice", Number(e.target.value))
                  }
                />
              </td>

              <td>
                {(item.qty * item.unitPrice).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addItem} style={{ marginTop: 20 }}>
        Add Item
      </button>

      <div style={{ marginTop: 30 }}>
        <p>Subtotal: {totals.subtotal.toFixed(2)}</p>
        <p>VAT (15%): {totals.vat.toFixed(2)}</p>
        <h2>Total: {totals.total.toFixed(2)}</h2>
      </div>
    </div>
  );
}
