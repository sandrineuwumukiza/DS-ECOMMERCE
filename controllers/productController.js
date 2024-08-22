import Product from '../models/productModel.js';
import cloudinary from '../utils/cloudinary.js';


export const addProduct = async (req, res, next) => {
  const { productName, price, description, category } = req.body;
  const image = req.file;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Authorization denied' });
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image.path, {
      folder: 'ecommerce',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
    });

    const newProduct = new Product({
      productName,
      price,
      description,
      category,
      image: {
        public_id: result.public_id,
        asset_id: result.asset_id,
        url: result.secure_url,
      },
      userId: req.user.id, 
    });

    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateProductById = async (req, res) => {
  try {
      const productId = req.params.id;
      const updateData = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });

      if (!updatedProduct) {
          return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json(updatedProduct);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
      const category = req.params.category;

      const products = await Product.find({ category });

      if (products.length === 0) {
          return res.status(404).json({ message: 'No products found in this category' });
      }

      res.status(200).json(products);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteProductById = async (req, res) => {
  try {
      const productId = req.params.id;

      const deletedProduct = await Product.findByIdAndDelete(productId);

      if (!deletedProduct) {
          return res.status(404).json({ message: 'Product not found' });
      }

      res.status(204).json({ message: 'Product deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};