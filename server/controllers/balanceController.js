import mongoose from "mongoose";
import Balance from "../models/Balance.js";

// Get user balance handler
export const getBalance = async (req, res) => {
  const userId = req.params.userId;

  try {
    const balance = await Balance.findOne({ userId }).exec();
    if (!balance) {
      return res
        .status(404)
        .json({ message: "Balance not found for this user" });
    }
    return res.status(200).json({ balance: balance.balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later" });
  }
};


export const topUp = async (req, res) => {
  const { userId } = req.params;
  let { topUpAmount } = req.body;

  console.log("Top-up endpoint hit:", userId, req.body);

  // Ensure topUpAmount is a number
  topUpAmount = parseFloat(topUpAmount);

  // Validate the top-up amount
  if (isNaN(topUpAmount) || topUpAmount <= 0) {
    return res.status(400).json({ message: "Invalid top-up amount" });
  }

  try {
    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId); // Correct way to instantiate ObjectId

    console.log("Attempting to find balance for userId:", userObjectId);

    // Check if the user balance exists
    let balance = await Balance.findOne({ userId: userObjectId });

    if (!balance) {
      // If no balance exists, create a new balance entry with the top-up amount
      console.log("No balance found for userId:", userId);
      balance = new Balance({
        userId: userObjectId,
        balance: topUpAmount, // Set the initial balance to the top-up amount
      });

      // Save the new balance entry
      await balance.save();
      console.log("New balance created:", balance.balance);
    } else {
      // If balance exists, sum the current balance and top-up amount
      console.log("User's balance before top-up:", balance.balance);
      balance.balance += topUpAmount;

      // Save the updated balance
      await balance.save();
      console.log("User's new balance after top-up:", balance.balance);
    }

    return res.status(200).json({
      message: "Top-up successful",
      balance: balance.balance,
    });
  } catch (err) {
    console.error("Top-up error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
