const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    phone: { type: String, default: null },
    shareProfileData: { type: Boolean, default: true },
    adsPerformance: { type: Boolean, default: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: Number, default: null },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
