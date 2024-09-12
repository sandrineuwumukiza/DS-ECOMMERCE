import Product from '../models/productModel.js';
import cloudinary from '../utils/cloudinary.js';

// Helper function to handle multiple image uploads
const uploadImages = async (files) => {
  const uploadPromises = files.map((file) =>
    cloudinary.uploader.upload(file.path, {
      folder: 'ecommerce',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
    })
  );

  return Promise.all(uploadPromises);
};

export const addProduct = async (req, res, next) => {
  const { name, description, price, discountPrice, sale, category, stock, features } = req.body;
  const images = req.files; // Array of image files
  const imageTypes = req.body.imageTypes; // Array of image types corresponding to the images

  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Authorization denied' });
  }

  try {
    // Upload images to Cloudinary
    const uploadedImages = await uploadImages(images);

    const imagesData = uploadedImages.map((result, index) => ({
      url: result.secure_url,
      type: imageTypes[index] // Ensure imageTypes array is in sync with the images array
    }));

    const newProduct = new Product({
      name,
      description,
      price,
      discountPrice,
      sale,
      category,
      stock,
      images: imagesData,
      features,
      user: req.user.id // Add user reference
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

    // If images are being updated
    if (req.files) {
      const images = req.files;
      const imageTypes = req.body.imageTypes;

      // Upload new images
      const uploadedImages = await uploadImages(images);

      const imagesData = uploadedImages.map((result, index) => ({
        url: result.secure_url,
        type: imageTypes[index]
      }));

      updateData.images = imagesData;
    }

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
