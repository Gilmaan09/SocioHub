const mongoose = require('mongoose')

const societySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    totalWings: { type: Number, default: 0, min: 0 },
    totalFlats: { type: Number, default: 0, min: 0 },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    about: { type: String, trim: true, maxlength: 3000, default: '' },
    establishedAt: { type: Date },
    amenities: { type: [String], default: [] },
    externalAmenities: { type: [String], default: ['Sit Out Area', 'Security 24 x 7', 'Banquet Hall', 'Terrace Garden', 'Kids Play Area', 'Gymnasium', 'Electrical Vehicle Charging', 'Yoga', '24 x 7 Water Supply'] },
    internalFeatures: { type: [String], default: ['Vitrified Tiles for Living, Dining, Kitchen & Bedrooms', 'Vitrified Tiles for Bathroom Flooring & Dado', 'Wash Basin Counters', "Vitrified Tile Dado 2'0\" high above Kitchen platform", 'Kitchen platform with SS sink & Drain board'] },
    sampleFlatPhotos: { type: [String], default: [] },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Society', societySchema)
