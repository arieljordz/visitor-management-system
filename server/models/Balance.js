import mongoose from 'mongoose';

const BalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model
    required: true,
  },
  balance: {
    type: Number,
    default: 0,  // Default balance
  },
});

export default mongoose.model('Balance', BalanceSchema);
