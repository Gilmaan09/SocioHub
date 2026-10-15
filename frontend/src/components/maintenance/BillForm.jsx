import { useState } from 'react'

const initialForm = { flatId: '', billingPeriod: '', maintenanceAmount: '', fineAmount: '0', dueDate: '', notes: '' }

export default function BillForm({ flats, onSubmit }) {
  const [form, setForm] = useState(initialForm)
  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  async function submit(event) { event.preventDefault(); await onSubmit(form); setForm(initialForm) }
  return <form className="bill-form admin-form" onSubmit={submit}><h2>Generate a bill</h2><label>Flat<select name="flatId" value={form.flatId} onChange={updateField} required><option value="">Select flat</option>{flats.map((flat) => <option key={flat._id} value={flat._id}>{flat.wingId?.name}-{flat.number}</option>)}</select></label><div className="form-row"><label>Billing period<input name="billingPeriod" type="month" value={form.billingPeriod} onChange={updateField} required /></label><label>Due date<input name="dueDate" type="date" value={form.dueDate} onChange={updateField} required /></label></div><div className="form-row"><label>Maintenance amount<input name="maintenanceAmount" type="number" min="0" value={form.maintenanceAmount} onChange={updateField} required /></label><label>Fine<input name="fineAmount" type="number" min="0" value={form.fineAmount} onChange={updateField} /></label></div><label>Notes<textarea name="notes" value={form.notes} onChange={updateField} /></label><button className="primary-button" type="submit">Create bill</button></form>
}
