import MyListModel from "../models/myList.model";

export const addToMyList = async (req, res) => {
  try {
    const userId = req.userId; //middleware
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true
    })
  }
}