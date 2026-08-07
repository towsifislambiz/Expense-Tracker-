import{c as p}from"./index-BszlgsFt.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]],x=p("FileSpreadsheet",c),b=(o=[])=>{if(!Array.isArray(o)||o.length===0){alert("No transactions available to export.");return}const r=["Title / Merchant","Amount","Type","Category","Date","Status","Note"],a=o.map(e=>[`"${(e.title||"").replace(/"/g,'""')}"`,e.amount||0,e.type||"expense",e.category||"others",e.date||"",e.status||"completed",`"${(e.notes||e.note||"").replace(/"/g,'""')}"`]),d=[r.join(","),...a.map(e=>e.join(","))].join(`
`),n=new Blob([d],{type:"text/csv;charset=utf-8;"}),l=URL.createObjectURL(n),i=new Date().toISOString().split("T")[0],t=document.createElement("a");t.setAttribute("href",l),t.setAttribute("download",`expense-ledger-${i}.csv`),document.body.appendChild(t),t.click(),document.body.removeChild(t)},m=(o=[])=>{if(!Array.isArray(o)||o.length===0){alert("No transactions available to export.");return}const r=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});let a=0,d=0;o.forEach(t=>{const e=Number(t.amount)||0,s=String(t.type||"").toLowerCase().trim();s==="income"&&(a+=e),s==="expense"&&(d+=e)});const n=a-d,l=window.open("","_blank");if(!l){alert("Pop-up blocked. Please allow pop-ups to generate PDF report.");return}const i=o.map(t=>`
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.date||""}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${t.title||"Untitled"}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-transform: capitalize;">${t.category||"general"}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-transform: uppercase; color: ${t.type==="income"?"#059669":"#dc2626"}; font-weight: bold;">${t.type||"expense"}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${t.type==="income"?"+":"-"}$${(Number(t.amount)||0).toFixed(2)}</td>
    </tr>
  `).join("");l.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Financial Ledger Report - ${r}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 24px; }
          h1 { font-size: 22px; margin-bottom: 4px; color: #0f172a; }
          .subtitle { font-size: 12px; color: #64748b; margin-bottom: 20px; }
          .summary-box { display: flex; gap: 16px; margin-bottom: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
          .stat { flex: 1; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .stat-val { font-size: 18px; font-weight: bold; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; padding: 8px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-weight: bold; text-transform: uppercase; font-size: 10px; color: #475569; }
        </style>
      </head>
      <body>
        <h1>Financial Ledger Report</h1>
        <div class="subtitle">Generated on ${r} • Total Transactions: ${o.length}</div>
        
        <div class="summary-box">
          <div class="stat">
            <div class="stat-label">Net Balance</div>
            <div class="stat-val" style="color: ${n>=0?"#059669":"#dc2626"}">$${n.toFixed(2)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Income</div>
            <div class="stat-val" style="color: #059669">$${a.toFixed(2)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Expense</div>
            <div class="stat-val" style="color: #dc2626">$${d.toFixed(2)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${i}
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.print();
          };
        <\/script>
      </body>
    </html>
  `),l.document.close()},y=m,g=b;export{x as F,m as a,y as b,g as c,b as e};
