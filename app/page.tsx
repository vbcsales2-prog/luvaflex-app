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
  qty: number;

  fabric: string;
  colour: string;
  slat: string;
  fixture: string;
  control: string;
  contLength: string;
  remarks: string;

  manualPrice?: number;
  editingPrice?: boolean;
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

// Outdoor pricing grid (unchanged)
const WIDTHS = [1000,1500,2000,2500,3000,3500,4000,4500,5000,5500,6000];
const DROPS = [1000,1500,2000,2500,3000,3500];

const PRICES:any = {
  3500:{6000:8316}, // simplified for now (your full grid still applies)
};

function roundUp(val:number, arr:number[]){
  for(const a of arr) if(val<=a) return a;
  return null;
}

function currency(v:number){
  return v.toLocaleString("en-ZA",{minimumFractionDigits:2});
}

export default function Page(){
  const [items,setItems]=useState<Item[]>([{
    id:"1",
    area:"",
    type:"Outdoor",
    width:"",
    drop:"",
    qty:1,
    fabric:"",
    colour:"",
    slat:"",
    fixture:"Rec",
    control:"RHC",
    contLength:"",
    remarks:""
  }]);

  const update=(id:string,field:keyof Item,value:any)=>{
    setItems(prev=>prev.map(i=>i.id===id?{...i,[field]:value}:i));
  };

  const addItem=()=>{
    setItems(prev=>[...prev,{
      id:Date.now().toString(),
      area:"",
      type:"Outdoor",
      width:"",
      drop:"",
      qty:1,
      fabric:"",
      colour:"",
      slat:"",
      fixture:"Rec",
      control:"RHC",
      contLength:"",
      remarks:""
    }]);
  };

  const computed = useMemo(()=>{
    return items.map(i=>{
      let unit=0;
      let total=0;
      let manual=false;

      if(i.type==="Outdoor"){
        if(i.width && i.drop){
          const w=roundUp(i.width*1000,WIDTHS);
          const d=roundUp(i.drop*1000,DROPS);
          if(w && d && PRICES[d]?.[w]){
            unit=PRICES[d][w];
          }
        }
      }else{
        manual=true;
        if(i.manualPrice) unit=i.manualPrice;
      }

      total=unit*i.qty;

      return {...i,unit,total,manual};
    });
  },[items]);

  const subtotal = computed.reduce((s,i)=>s+i.total,0);
  const vat = subtotal*0.15;

  return(
    <div style={{padding:20,fontFamily:"Arial"}}>
      <h1>Luvaflex Quote App</h1>

      <table border={1} cellPadding={6} style={{width:"100%",marginTop:20}}>
        <thead>
          <tr>
            <th>Area</th>
            <th>Type</th>
            <th>Width</th>
            <th>Drop</th>
            <th>Fabric</th>
            <th>Colour</th>
            <th>Slat</th>
            <th>Fixture</th>
            <th>Control</th>
            <th>Remarks</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {computed.map(i=>(
            <tr key={i.id}>
              <td><input value={i.area} onChange={e=>update(i.id,"area",e.target.value)}/></td>

              <td>
                <select value={i.type} onChange={e=>update(i.id,"type",e.target.value)}>
                  {TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </td>

              <td><input type="number" value={i.width} onChange={e=>update(i.id,"width",Number(e.target.value))}/></td>
              <td><input type="number" value={i.drop} onChange={e=>update(i.id,"drop",Number(e.target.value))}/></td>

              {/* FABRIC */}
              <td>
                {i.type==="Outdoor"?(
                  <select value={i.fabric} onChange={e=>update(i.id,"fabric",e.target.value)}>
                    <option>Sheerweave</option>
                    <option>PVC</option>
                    <option>Ribtext</option>
                  </select>
                ):(
                  <input value={i.fabric} onChange={e=>update(i.id,"fabric",e.target.value)}/>
                )}
              </td>

              <td><input value={i.colour} onChange={e=>update(i.id,"colour",e.target.value)}/></td>

              <td>
                {i.type==="Venetian"?(
                  <select value={i.slat} onChange={e=>update(i.id,"slat",e.target.value)}>
                    <option>25mm</option>
                    <option>50mm</option>
                  </select>
                ): i.type==="Vertical"?(
                  <select>
                    <option>90mm</option>
                    <option>127mm</option>
                    <option>250mm</option>
                  </select>
                ):(
                  "N/A"
                )}
              </td>

              <td>
                <select value={i.fixture} onChange={e=>update(i.id,"fixture",e.target.value)}>
                  <option>Rec</option>
                  <option>F/F</option>
                  <option>Custom</option>
                </select>
              </td>

              <td>
                <select value={i.control} onChange={e=>update(i.id,"control",e.target.value)}>
                  <option>RHC</option>
                  <option>LHC</option>
                </select>
              </td>

              {/* REMARKS */}
              <td>
                {i.type==="Outdoor"?(
                  <select value={i.remarks} onChange={e=>update(i.id,"remarks",e.target.value)}>
                    <option>With Window</option>
                    <option>Without Window</option>
                  </select>
                ):(
                  <input value={i.remarks} onChange={e=>update(i.id,"remarks",e.target.value)}/>
                )}
              </td>

              <td><input type="number" value={i.qty} onChange={e=>update(i.id,"qty",Number(e.target.value))}/></td>

              {/* UNIT PRICE */}
              <td>
                {i.manual ? (
                  i.editingPrice ? (
                    <input
                      type="number"
                      onBlur={(e)=>{
                        update(i.id,"manualPrice",Number(e.target.value));
                        update(i.id,"editingPrice",false);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      style={{cursor:"pointer",color:"blue"}}
                      onClick={()=>update(i.id,"editingPrice",true)}
                    >
                      {i.manualPrice ? currency(i.manualPrice) : "Manual Entry"}
                    </span>
                  )
                ) : (
                  currency(i.unit)
                )}
              </td>

              <td>{i.total?currency(i.total):"-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addItem} style={{marginTop:10}}>Add Item</button>

      <div style={{marginTop:20}}>
        <p>Subtotal: {currency(subtotal)}</p>
        <p>VAT: {currency(vat)}</p>
        <h2>Total: {currency(subtotal+vat)}</h2>
      </div>
    </div>
  );
}
