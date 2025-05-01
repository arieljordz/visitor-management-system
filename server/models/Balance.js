import mongoose from "mongoose";

const BalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  balance: {
    type: Number,
    default: 0, 
  },
});

export default mongoose.model("Balance", BalanceSchema);
