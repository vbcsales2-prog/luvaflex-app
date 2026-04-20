"use client";

import { useMemo, useState } from "react";

type QuoteItem = {
  id: number;
  description: string;
  width: number;
  drop: number;
  qty: number;
  unitPrice: number;
};

const createItem = (id: number): QuoteItem => ({
  id,
  description: "Roller Blind",
  width: 1000,
  drop: 1500,
  qty: 1,
  unitPrice: 0,
});

export default function Page() {
  const [items, setItems] = useState<QuoteItem[]>([createItem(1)]);
  const [nextId, setNextId] = useState(2);

  const updateItem = <K extends keyof QuoteItem>(
    id: number,
    field: K,
    value: QuoteItem[K]
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [...current, createItem(nextId)]);
    setNextId((current) => current + 1);
  };

  const removeItem = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const getItemTotal = (item: QuoteItem) => item.qty * item.unitPrice;

  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + getItemTotal(item), 0),
    [items]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <main className="mx-auto w-full max-w-6xl bg-white p-4 text-sm text-black print:max-w-none print:p-2">
      <section className="mb-4 border border-gray-300 p-3 print:mb-2 print:p-2">
        <h1 className="text-lg font-bold leading-tight">Luvaflex Quote</h1>
        <p className="text-xs leading-tight text-gray-600">
          Lead time: 10–12 working days
        </p>
      </section>

      <section className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1 text-left font-semibold">
                Description
              </th>
              <th className="border border-gray-300 p-1 text-left font-semibold">
                Width (mm)
              </th>
              <th className="border border-gray-300 p-1 text-left font-semibold">
                Drop (mm)
              </th>
              <th className="border border-gray-300 p-1 text-left font-semibold">
                Qty
              </th>
              <th className="border border-gray-300 p-1 text-left font-semibold">
                Unit Price
              </th>
              <th className="border border-gray-300 p-1 text-right font-semibold">
                Total
              </th>
              <th className="border border-gray-300 p-1 text-center font-semibold print:hidden">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 p-1 align-top">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    className="w-full rounded-none border border-gray-200 px-1 py-1 outline-none"
                  />
                </td>

                <td className="border border-gray-300 p-1 align-top">
                  <input
                    type="number"
                    value={item.width}
                    onChange={(e) =>
                      updateItem(item.id, "width", Number(e.target.value) || 0)
                    }
                    className="w-full rounded-none border border-gray-200 px-1 py-1 outline-none"
                  />
                </td>

                <td className="border border-gray-300 p-1 align-top">
                  <input
                    type="number"
                    value={item.drop}
                    onChange={(e) =>
                      updateItem(item.id, "drop", Number(e.target.value) || 0)
                    }
                    className="w-full rounded-none border border-gray-200 px-1 py-1 outline-none"
                  />
                </td>

                <td className="border border-gray-300 p-1 align-top">
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(item.id, "qty", Number(e.target.value) || 0)
                    }
                    className="w-full rounded-none border border-gray-200 px-1 py-1 outline-none"
                  />
                </td>

                <td className="border border-gray-300 p-1 align-top">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(item.id, "unitPrice", Number(e.target.value) || 0)
                    }
                    className="w-full rounded-none border border-gray-200 px-1 py-1 outline-none"
                  />
                </td>

                <td className="border border-gray-300 p-1 text-right align-middle">
                  {formatCurrency(getItemTotal(item))}
                </td>

                <td className="border border-gray-300 p-1 text-center align-middle print:hidden">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded border border-red-300 px-2 py-1 text-red-600"
                    disabled={items.length === 1}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-3 flex items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={addItem}
          className="rounded border border-black px-3 py-1.5 text-xs font-medium"
        >
          + Add Item
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded border border-black bg-black px-3 py-1.5 text-xs font-medium text-white"
        >
          Print Quote
        </button>
      </section>

      <section className="mt-4 flex justify-end print:mt-2">
        <div className="w-full max-w-xs border border-gray-300 p-2">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
