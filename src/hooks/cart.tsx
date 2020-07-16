import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('@GoMarket:products');

      if (storageProducts) {
        setProducts([...JSON.parse(storageProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // const cartProducts = products.find(prod => prod.id === product.id);
      // if (cartProducts) {
      //   // add quantity
      //   const handledProduct = products.map(prod =>
      //     prod.id === product.id
      //       ? { ...product, quantity: prod.quantity + 1 }
      //       : prod,
      //   );
      //   setProducts(handledProduct);
      // } else {
      //   setProducts([...products, { ...product, quantity: 1 }]);
      // }
      const prodE = products.find(p => p.id === product.id);

      if (prodE) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const handledProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(handledProducts);

      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(handledProducts),
      );

      // const prod = products.find(product => product.id === id);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const handledProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );

      setProducts(handledProducts);

      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(handledProducts),
      );

      // const prod = products.find(product => product.id === id);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
