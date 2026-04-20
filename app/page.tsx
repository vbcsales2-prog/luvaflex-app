"use client";

import React, { useState } from "react";

type Item = {
  description: string;
  width: number;
  drop: number;
  qty: number;
  unitPrice: number;
};

export default function Page() {
  const [items, setItems] = useState<Item[]>([
    { description: "Roller Blind", width: 1000, drop: 1500, qty: 1, unitPrice: 0 },
  ]);

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      { description: "", width: 0, drop: 0, qty: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const getItemTotal = (item: Item) => {
    return item.qty * item.unitPrice;
  };

  const grandTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);

  return (
    <div className="p-4 text-sm print:p-2">
      {/* HEADER */}
      <div className="mb-2">
        <h1 className="text-lg font-bold">Luvaflex Quote</h1>
        <p className="text-xs">Lead Time: 10–12 working days</p>
      </div>

      {/* TABLE */}
      <table className="w-full border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">Description</th>
            <th className="border p-1">Width (mm)</th>
            <th className="border p-1">Drop (mm)</th>
            <th className="border p-1">Qty</th>
            <th className="border p-1">Unit Price</th>
            <th className="border p-1">Total</th>
            <th className="border p-1 print:hidden">Action</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="border p-1">
                <input
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  className="w-full"
                />
              </td>

              <td className="border p-1">
                <input
                  type="number"
                  value={item.width}
                  onChange={(e) =>
                    updateItem(index, "width", Number(e.target.value))
                  }
                  className="w-full"
                />
              </td>

              <td className="border p-1">
                <input
                  type="number"
                  value={item.drop}
                  onChange={(e) =>
                    updateItem(index, "drop", Number(e.target.value))
                  }
                  className="w-full"
                />
              </td>

              <td className="border p-1">
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) =>
                    updateItem(index, "qty", Number(e.target.value))
                  }
                  className="w-full"
                />
              </td>

              <td className="border p-1">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(index, "unitPrice", Number(e.target.value))
                  }
                  className="w-full"
                />
              </td>

              <td className="border p-1 text-right">
                {getItemTotal(item).toFixed(2)}
              </td>

              <td className="border p-1 print:hidden">
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD BUTTON */}
      <div className="mt-2 print:hidden">
        <button
          onClick={addItem}
          className="px-2 py-1 bg-black text-white text-xs"
        >
          + Add Item
        </button>
      </div>

      {/* TOTALS */}
      <div className="mt-4 text-right">
        <h2 className="text-sm font-bold">
          Grand Total: {grandTotal.toFixed(2)}
        </h2>
      </div>

      {/* PRINT BUTTON */}
      <div className="mt-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-3 py-1 bg-blue-600 text-white text-xs"
        >
          Print Quote
        </button>
      </div>
    </div>
  );
}
