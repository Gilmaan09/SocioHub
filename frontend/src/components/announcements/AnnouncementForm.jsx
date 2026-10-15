import { useState } from 'react'

const emptyForm = { title: '', description: '', priority: 'NORMAL', attachmentUrl: '', wingId: '' }
export default function AnnouncementForm({ wings, initialValue, onSubmit }) {
  const [form, setForm] = useState(initialValue || emptyForm)
  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  async function submit(event) { event.preventDefault(); await onSubmit({ ...form, publishAt: new Date().toISOString(), wingId: form.wingId || null }) }
  return <form className="announcement-form admin-form" onSubmit={submit}><label>Title<input name="title" value={form.title} onChange={updateField} required /></label><label>Description<textarea name="description" value={form.description} onChange={updateField} required /></label><label>Audience<select name="wingId" value={form.wingId || ''} onChange={updateField}><option value="">Entire society</option>{wings.map((wing) => <option key={wing._id} value={wing._id}>Wing {wing.name}</option>)}</select></label><label>Priority<select name="priority" value={form.priority} onChange={updateField}><option value="NORMAL">Normal</option><option value="IMPORTANT">Important</option></select></label><p className="announcement-publish-note">This announcement will publish immediately when you submit it.</p><label>Attachment URL (optional)<input name="attachmentUrl" value={form.attachmentUrl || ''} onChange={updateField} /></label><button className="primary-button" type="submit">Publish announcement</button></form>
}
