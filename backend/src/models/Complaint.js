const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true, index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    complaintNumber: { type: String, required: true, unique: true },
    category: { type: String, enum: ['PLUMBING', 'ELECTRICAL', 'LIFT', 'PARKING', 'SECURITY', 'CLEANING', 'OTHER'], required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    status: { type: String, enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN', index: true },
    imageUrl: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminResponse: { type: String, trim: true, maxlength: 2000 },
    resolvedAt: Date,
  },
  { timestamps: true },
)

module.exports = mongoose.model('Complaint', complaintSchema)
