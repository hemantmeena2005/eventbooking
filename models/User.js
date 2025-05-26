import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this user.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email for this user.'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password for this user.'],
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema); 