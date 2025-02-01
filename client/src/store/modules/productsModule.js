import { decryptData } from "../../utils/encryptData";

const productsModule = {
  state: () => ({
    products: [],
    product: null,
    errorState: null,
  }),
  mutations: {
    setProducts(state, products) {
      state.products = products;
      state.errorState = null;
    },
    setProduct(state, product) {
      state.product = product;
      state.errorState = null;
    },
    addProduct(state, product) {
      state.products.push(product);
      state.errorState = null;
    },
    updateProduct(state, updatedProduct) {
      const index = state.products.findIndex((p) => p.id === updatedProduct.id);
      if (index !== -1) {
        state.products.splice(index, 1, updatedProduct);
      }
      state.errorState = null;
    },
    deleteProduct(state, id) {
      state.products = state.products.filter((product) => product.id !== id);
      state.errorState = null;
    },
    setError(state, error) {
      state.errorState = error;
    },
  },
  actions: {
    async fetchProductsAction({ commit }) {
      try {
        const response = await fetch("http://localhost:3000/products", {
          headers: {
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("token")
            )}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.json();
          commit("setError", {
            status: response.status,
            message: errorMessage.error,
          });

          return;
        }
        const data = await response.json();
        commit("setProducts", data);
      } catch (error) {
        console.error("Fetch Products Error:", error.message);
      }
    },
    async fetchProductAction({ commit }, id) {
      try {
        const response = await fetch(`http://localhost:3000/products/${id}`, {
          headers: {
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("token")
            )}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.json();
          commit("setError", {
            status: response.status,
            message: errorMessage.error,
          });

          return;
        }
        const data = await response.json();
        commit("setProduct", data);
      } catch (error) {
        console.error("Fetch Products Error:", error.message);
      }
    },
    async addProductAction({ commit }, payload) {
      try {
        const response = await fetch("http://localhost:3000/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("token")
            )}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorMessage = await response.json();
          commit("setError", {
            status: response.status,
            message: errorMessage.error,
          });

          return;
        }
        const newProduct = await response.json();
        commit("addProduct", newProduct);
      } catch (error) {
        console.error("Add Product Error:", error.message);
        throw error;
      }
    },
    async updateProductAction({ commit }, { id, payload }) {
      try {
        const response = await fetch(`http://localhost:3000/products/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("token")
            )}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorMessage = await response.json();
          commit("setError", {
            status: response.status,
            message: errorMessage.error,
          });

          return;
        }
        const updatedProduct = await response.json();
        commit("updateProduct", updatedProduct);
      } catch (error) {
        console.error("Update Product Error:", error.message);
        throw error;
      }
    },
    async deleteProductAction({ commit }, id) {
      try {
        const response = await fetch(`http://localhost:3000/products/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("token")
            )}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.json();
          commit("setError", {
            status: response.status,
            message: errorMessage.error,
          });

          return;
        }
        commit("deleteProduct", id);
      } catch (error) {
        console.error("Delete Product Error:", error.message);
      }
    },
  },
  getters: {
    allProducts: (state) => state.products,
    productToView: (state) => state.product,
    getError: (state) => state.errorState,
  },
};

export default productsModule;
