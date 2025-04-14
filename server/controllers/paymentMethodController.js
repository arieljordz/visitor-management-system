import mongoose from "mongoose";
import PaymentMethod from "../models/PaymentMethod.js";

// GET all payment methods
export const getAllPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find();
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST a new payment method
export const createPaymentMethod = async (req, res) => {
  const { method, accountName, accountNumber, bankName } = req.body;

  try {
    const newMethod = new PaymentMethod({
      method,
      accountName,
      accountNumber,
      bankName: method === "Bank" ? bankName : undefined,
    });

    await newMethod.save();
    res.status(201).json(newMethod);
  } catch (err) {
    res.status(400).json({ error: "Invalid payment method data" });
  }
};
