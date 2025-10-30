import mongoose from "mongoose";

const myListModel = new mongoose.Schema({
  productTitle: {
    type: String, 
    required: true
  },
  image: {
    type: String, 
    required: true
  },
  rating: {
    type: Number,
    required: true
  }, 
  price: {
    type: Number,
    required: true
  },
  oldPrice: {
    type: Number,
    required: true
  },
  brand: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
}, {
  timestamps: true
});

const MyListModel = mongoose.model("MyList", myListModel);
export default MyListModel;
