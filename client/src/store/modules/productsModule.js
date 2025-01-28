const productsModule = {
    state: () => ({
      products: [], 
      product: null
    }),
    mutations: {
      setProducts(state, products) {
        state.products = products;
      },
      setProduct(state, product) {
        state.product = product;
      },
      addProduct(state, product) {
        state.products.push(product);
      },
      updateProduct(state, updatedProduct) {
        const index = state.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          state.products.splice(index, 1, updatedProduct);
        }
      },
      deleteProduct(state, id) {
        state.products = state.products.filter(product => product.id !== id);
      },
    },
    actions: {
      async fetchProductsAction({ commit }) {
        try {
          const response = await fetch('http://localhost:3000/products', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch products');
          const data = await response.json();
          commit('setProducts', data);
        } catch (error) {
          console.error('Fetch Products Error:', error.message);
        }
      },
      async fetchProductAction({ commit }, id) {
        try {
          const response = await fetch(`http://localhost:3000/products/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch products');
          const data = await response.json();
          commit('setProduct', data);
        } catch (error) {
          console.error('Fetch Products Error:', error.message);
        }
      },
      async addProductAction({ commit }, payload) {
        try {
          const response = await fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error('Failed to add product');
          const newProduct = await response.json();
          commit('addProduct', newProduct);
        } catch (error) {
          console.error('Add Product Error:', error.message);
          throw error;
        }
      },
      async updateProductAction({ commit }, { id, payload }) {
        try {
          const response = await fetch(`http://localhost:3000/products/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error('Failed to update product');
          const updatedProduct = await response.json();
          commit('updateProduct', updatedProduct);
        } catch (error) {
          console.error('Update Product Error:', error.message);
          throw error;
        }
      },
      async deleteProductAction({ commit }, id) {
        try {
          const response = await fetch(`http://localhost:3000/products/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!response.ok) throw new Error('Failed to delete product');
          commit('deleteProduct', id);
        } catch (error) {
          console.error('Delete Product Error:', error.message);
        }
      },
    },
    getters: {
      allProducts: (state) => state.products,
      productToView: (state) => state.product
    },
  };
  
  export default productsModule;
  