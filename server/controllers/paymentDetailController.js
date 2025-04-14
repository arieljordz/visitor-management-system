import mongoose from "mongoose";
import Balance from "../models/Balance.js"; // Assuming Balance schema is located here
import PaymentDetail from "../models/PaymentDetail.js";
import User from "../models/User.js"; // Make sure to import the User model

// Process payment handler
export const processPayment = async (req, res) => {
  const { userId } = req.body;

  console.log("processPayment");
  // Validate the user ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    // Fetch the user's balance document
    const userBalance = await Balance.findOne({ userId }).exec();
    if (!userBalance) {
      return res.status(404).json({ message: "User balance not found" });
    }

    // Fetch the user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assume the amount to pay is 100 pesos per generation
    const amount = 100;

    // Check if user has sufficient balance
    if (userBalance.balance < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient balance for payment" });
    }

    // Create a new PaymentDetails document
    const payment = new PaymentDetail({
      userId: user._id,
      amount: amount,
      paymentMethod: "e-wallet", // This can be dynamic based on the request
      transactionId: "txn" + Date.now(), // Use a more robust transaction ID in a real application
      status: "completed", // Assuming payment is successful
    });

    // Save payment details
    await payment.save();

    // Deduct the paid amount from the user's balance
    userBalance.balance -= amount;
    await userBalance.save();

    // Return success response with payment details and updated balance
    return res.status(200).json({
      message: "Payment successful",
      balance: userBalance.balance, // Include updated balance in response
      paymentDetails: payment,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later" });
  }
};
