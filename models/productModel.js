import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    validate: {
      validator: function(value) {
        return value ? value < this.price : true;
      },
      message: 'Discount price must be less than the regular price'
    }
  },
  sale: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    enum: ['Air Conditioners', 'Gadgets', 'Home Appliances', 'Kitchen Appliances', 'Computer', 'Refrigerator', 'Smart Phone']
  },
  stock: { 
    type: Number, 
    required: true 
  },
  image: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['default', 'hover', 'gallery'],
      required: true
    }
  }],
  features: [String],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
