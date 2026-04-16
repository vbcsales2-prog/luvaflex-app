"use client";

import React, { useMemo, useState } from "react";

type Item = {
  id: string;
  room: string;
  product: string;
  width: number;
  drop: number;
  qty: number;
  controlSide: string;
};

const WIDTH_STEPS = [500,1000,1500,2000,2500,3000,3500,4000];
const DROP_STEPS = [1000,1500,2000,2500,3000,3500];

// ⚠️ SAMPLE pricing (we will replace with your real grid next)
function getPrice(width:number, drop:number){
  return (width/1000) * (drop/1000) * 250;
}

// Round UP to next available size
function roundUp(value:number, steps:number[]){
  for(let s of steps){
    if(value <= s) return s;
  }
  return steps[steps.length-1];
}

export default function Page(){

  const [items, setItems] = useState<Item[]>([
    {
      id:"1",
      room:"",
      product:"Outdoor Drop Blind",
      width:0,
      drop:0,
      qty:1,
      controlSide:"Left"
    }
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id:Date.now().toString(),
        room:"",
        product:"Outdoor Drop Blind",
        width:0,
        drop:0,
        qty:1,
        controlSide:"Left"
      }
    ]);
  };

  const updateItem = (id:string, field:keyof Item, value:any)=>{
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const totals = useMemo(()=>{
    let subtotal = 0;

    items.forEach(item=>{
      const chargeWidth = roundUp(item.width, WIDTH_STEPS);
      const chargeDrop = roundUp(item.drop, DROP_STEPS);
      const unit = getPrice(chargeWidth, chargeDrop);
      subtotal += unit * item.qty;
    });

    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    return { subtotal, vat, total };

  },[items]);

  return (
    <div style={{padding:20,fontFamily:"Arial"}}>
      <h1>Luvaflex Quote App</h1>

      <table border={1} cellPadding={8} style={{width:"100%",marginTop:20}}>
        <thead>
          <tr>
            <th>Room</th>
            <th>Product</th>
            <th>Width (Measured mm)</th>
            <th>Drop (Measured mm)</th>
            <th>Control Side</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map(item=>{

            const chargeWidth = roundUp(item.width, WIDTH_STEPS);
            const chargeDrop = roundUp(item.drop, DROP_STEPS);
            const unitPrice = getPrice(chargeWidth, chargeDrop);

            return (
              <tr key={item.id}>
                <td>
                  <input value={item.room}
                    onChange={e=>updateItem(item.id,"room",e.target.value)}
                  />
                </td>

                <td>{item.product}</td>

                <td>
                  <input type="number"
                    value={item.width}
                    onChange={e=>updateItem(item.id,"width",Number(e.target.value))}
                  />
                </td>

                <td>
                  <input type="number"
                    value={item.drop}
                    onChange={e=>updateItem(item.id,"drop",Number(e.target.value))}
                  />
                </td>

                <td>
                  <select
                    value={item.controlSide}
                    onChange={e=>updateItem(item.id,"controlSide",e.target.value)}
                  >
                    <option>Left</option>
                    <option>Right</option>
                  </select>
                </td>

                <td>
                  <input type="number"
                    value={item.qty}
                    onChange={e=>updateItem(item.id,"qty",Number(e.target.value))}
                  />
                </td>

                <td>{unitPrice.toFixed(2)}</td>

                <td>{(unitPrice * item.qty).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button onClick={addItem} style={{marginTop:20}}>
        Add Item
      </button>

      <div style={{marginTop:30}}>
        <p>Subtotal: {totals.subtotal.toFixed(2)}</p>
        <p>VAT (15%): {totals.vat.toFixed(2)}</p>
        <h2>Total: {totals.total.toFixed(2)}</h2>
      </div>
    </div>
  );
}
