import { getAllProducts } from "../repository/product.repository";

export const fetchAllProducts = async () => {
  try {
    const products = await getAllProducts();
    return { 
      success: true, 
      data: products 
    };
  } catch (error) {
    console.error("Service Hatası [fetchAllProducts]:", error);
    return { 
      success: false, 
      error: "Ürünler getirilirken sistemsel bir hata oluştu." 
    };
  }
};