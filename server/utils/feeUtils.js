import Fee from "../models/Fee.js"; 
import { StatusEnum } from "../enums/enums.js";

export const fetchFeeByCodeAndStatus = async (feeCode, status = StatusEnum.ACTIVE) => {
  try {
    const fee = await Fee.findOne({ feeCode, status });

    if (!fee) {
      throw new Error(`Fee with code '${feeCode}' and status '${status}' not found.`);
    }

    return fee;
  } catch (error) {
    console.error("Fee Utility Error:", error);
    throw error;
  }
};
