"use server";

import { fetchAllProducts } from "../service/product.service";

export const getProductsAction = async () => {
    // Burada gerekirse kullanıcının yetkisi var mı (auth) kontrolü de yapılabilir.
    return await fetchAllProducts();
};