import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, FlatList, Text, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';



export default function App() {
  const [productName, setProductName] = useState(''); // Current product name input
  const [productType, setProductType] = useState(''); // Current product type input
  const [price, setPrice] = useState(''); // Current product price input
  const [products, setProducts] = useState([]); // List of all products
  const [modalVisible, setModalVisible] = useState(false); // Whether the modal is visible
  const [selectedProductId, setSelectedProductId] = useState(null); // The id of the product to be updated
  const [newProductName, setNewProductName] = useState(''); // New product name input
  const [newProductType, setNewProductType] = useState(''); // New product type input
  const [newPrice, setNewPrice] = useState(''); // New product price input

  /**
   * Get all products from Firestore
   */
  useEffect(() => {
    const getProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      });

      return () => unsubscribe();
    };    
    getProducts();
  }, []);

  /**
   * Add a product to the database
   */
  const addProduct = async () => {
    if (productName.trim() === '' || productType.trim() === '' || price.trim() === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        productName: productName,
        productType: productType,
        price: parseFloat(price),
        createdAt: new Date(),
      });
      setProductName('');
      setProductType('');
      setPrice('');
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  /**
   * Update a product in the database
   * @param {string} id The id of the product to be updated
   */
  const updateProduct = (id) => {
    const productToUpdate = products.find(item => item.id === id);
    if (!productToUpdate) return;

    setSelectedProductId(id);
    setNewProductName(productToUpdate.productName);
    setNewProductType(productToUpdate.productType);
    setNewPrice(productToUpdate.price.toString());
    setModalVisible(true);
  };

  /**
   * Handle the update button press
   */
  const handleUpdate = async () => {
    if (newProductName.trim() === '' || newProductType.trim() === '' || newPrice.trim() === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const productRef = doc(db, 'products', selectedProductId);
      await updateDoc(productRef, {
        productName: newProductName,
        productType: newProductType,
        price: parseFloat(newPrice),
      });
      setModalVisible(false);
      setNewProductName('');
      setNewProductType('');
      setNewPrice('');
    } catch (error) {
      console.error("Error updating product: ", error);
    }
  };

  /**
   * Delete a product from the database
   * @param {string} id The id of the product to be deleted
   */
  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };


  const renderItem = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskText}>Tên sản phẩm: {item.productName}</Text>
      <Text style={styles.taskText}>Loại sản phẩm: {item.productType}</Text>
      <Text style={styles.taskText}>Giá: {item.price}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => updateProduct(item.id)} style={styles.updateButton}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteProduct(item.id)} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Thanh nhập sản phẩm */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tên sản phẩm"
          value={productName}
          onChangeText={text => setProductName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Loại sản phẩm"
          value={productType}
          onChangeText={text => setProductType(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Giá"
          value={price}
          onChangeText={text => setPrice(text)}
          keyboardType="numeric"
        />
        <Button title="Add" onPress={addProduct} />
      </View>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No products available</Text>}
      />

      {/* Modal cập nhật sản phẩm */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalView}>
          <TextInput
            style={styles.input1}
            placeholder="Tên sản phẩm mới"
            value={newProductName}
            onChangeText={setNewProductName}
          />
          <TextInput
            style={styles.input1}
            placeholder="Loại sản phẩm mới"
            value={newProductType}
            onChangeText={setNewProductType}
          />
          <TextInput
            style={styles.input1}
            placeholder="Giá mới"
            value={newPrice}
            onChangeText={setNewPrice}
            keyboardType="numeric"
          />
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={handleUpdate}>
            <Text style={styles.textStyle}>Update</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalVisible(!modalVisible)}>
            <Text style={styles.textStyle}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginRight: 10,
  },
  input1: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  taskContainer: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  taskText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  updateButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
