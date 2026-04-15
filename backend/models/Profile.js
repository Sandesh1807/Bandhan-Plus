// Profile model — all matrimony-related info
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  // Reference to the User who owns this profile
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ── PERSONAL INFO ──────────────────────────────────────
  name: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  dateOfBirth: { type: Date, required: true },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  complexion: { type: String }, // kept optional, not forced
  bloodGroup: { type: String },
  maritalStatus: {
    type: String,
    enum: ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'],
    default: 'Never Married'
  },
  abilities: { type: String }, // any disability info
  motherTongue: { type: String },
  languages: [{ type: String }], // languages spoken

  // ── RELIGION & COMMUNITY ────────────────────────────────
  religion: { type: String },
  caste: { type: String },
  subCaste: { type: String },
  gothra: { type: String },
  manglik: { type: String, enum: ['Yes', 'No', 'Anshik'] },
  horoscope: { type: String },

  // ── EDUCATION & CAREER ──────────────────────────────────
  education: { type: String },
  educationDetails: { type: String },
  profession: { type: String },
  company: { type: String },
  annualIncome: { type: String }, // e.g., "5-10 LPA"
  workLocation: { type: String },

  // ── LOCATION ────────────────────────────────────────────
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  residencyStatus: { type: String, enum: ['Citizen', 'Permanent Resident', 'Student Visa', 'Work Permit', 'Other'] },

  // ── FAMILY INFO ─────────────────────────────────────────
  fatherName: { type: String },
  fatherOccupation: { type: String },
  motherName: { type: String },
  motherOccupation: { type: String },
  siblings: { type: Number, default: 0 },
  familyType: { type: String, enum: ['Nuclear', 'Joint', 'Extended'] },
  familyStatus: { type: String, enum: ['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent'] },
  familyValues: { type: String, enum: ['Traditional', 'Moderate', 'Liberal'] },

  // ── LIFESTYLE ───────────────────────────────────────────
  diet: { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain'] },
  smoking: { type: String, enum: ['No', 'Occasionally', 'Yes'] },
  drinking: { type: String, enum: ['No', 'Occasionally', 'Yes'] },
  hobbies: [{ type: String }],

  // ── PARTNER PREFERENCES ─────────────────────────────────
  partnerAgeMin: { type: Number },
  partnerAgeMax: { type: Number },
  partnerHeightMin: { type: Number },
  partnerHeightMax: { type: Number },
  partnerReligion: [{ type: String }],
  partnerCaste: [{ type: String }],
  partnerEducation: [{ type: String }],
  partnerProfession: [{ type: String }],
  partnerLocation: [{ type: String }],
  partnerIncome: { type: String },
  partnerDiet: [{ type: String }],
  partnerMaritalStatus: [{ type: String }],
  partnerDescription: { type: String }, // freetext about ideal partner

  // ── MEDIA ───────────────────────────────────────────────
  photos: [{ type: String }],    // array of photo filenames
  videoIntro: { type: String },  // 30-sec video filename

  // ── ABOUT ME ────────────────────────────────────────────
  aboutMe: { type: String, maxlength: 500 },

  // ── VERIFICATION ────────────────────────────────────────
  isVerified: { type: Boolean, default: false },
  verificationDocs: [{ type: String }], // uploaded ID doc filenames
  trustScore: { type: Number, default: 0, min: 0, max: 100 },

  // ── INTERESTS ───────────────────────────────────────────
  // Users who sent interest to this profile
  interestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  interestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  // Mutually matched profiles
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],

  // Profile active or hidden
  isActive: { type: Boolean, default: true },

  isPremium: { type: Boolean, default: false },
  freeMessagesSent: { type: Number, default: 0 },

}, { timestamps: true });

// Virtual: calculate age from dateOfBirth
profileSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

profileSchema.set('toJSON', { virtuals: true });
profileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Profile', profileSchema);