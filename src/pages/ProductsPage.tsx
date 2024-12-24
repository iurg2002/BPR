import React, { useEffect, useState } from "react";
import { Table, Alert, Spinner, Container, Button, Modal, Form } from "react-bootstrap";
import { Product } from "../models/Product";
import { addProduct, updateProduct, deleteProduct, getProducts } from "../services/productService";

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [updatedProductData, setUpdatedProductData] = useState<Partial<Product>>({});
    const [newProductData, setNewProductData] = useState<Omit<Product, "id">>({
      productId: "",
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      personalization: "",
      upsell: 0,
      stock: 0,
      category: "",
    });
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const fetchedProducts = await getProducts();
          setProducts(fetchedProducts);
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchProducts();
    }, []);
  
    if (loading) {
      return (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      );
    }
  
    const handleEditProduct = (product: Product) => {
      setSelectedProduct(product);
      setUpdatedProductData(product);
      setShowEditModal(true);
    };
  
    const handleSaveProductChanges = async () => {
      if (selectedProduct) {
        try {
          await updateProduct(selectedProduct.id, updatedProductData);
          setProducts((prev) =>
            prev.map((prod) =>
              prod.id === selectedProduct.id ? { ...prod, ...updatedProductData } : prod
            )
          );
          setShowEditModal(false);
        } catch (error) {
          console.error("Error updating product:", error);
        }
      }
    };
  
    const handleProductInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setUpdatedProductData((prev) => ({
        ...prev,
        [name]: name === "price" || name === "upsell" || name === "stock" ? Number(value) : value,
      }));
    };
  
    const handleAddProduct = async () => {
        try {
          // Pass all fields from `newProductData` to `addProduct`
          const newProduct = await addProduct({
            productId: newProductData.productId,
            name: newProductData.name,
            description: newProductData.description,
            price: newProductData.price,
            imageUrl: newProductData.imageUrl,
            personalization: newProductData.personalization,
            upsell: newProductData.upsell,
            stock: newProductData.stock,
            category: newProductData.category,
          });
      
          // Update state with the newly added product
          setProducts((prev) => [...prev, newProduct]);
      
          // Reset the form data after adding
          resetNewProductData();
          setShowAddModal(false);
        } catch (error) {
          console.error("Error adding product:", error);
        }
      };
      
  
    const handleNewProductInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setNewProductData((prev) => ({
        ...prev,
        [name]: name === "price" || name === "upsell" || name === "stock"  ? Number(value) : value,
      }));
    };
  
    const handleDeleteProduct = async (productId: string) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
        try {
          await deleteProduct(productId);
          setProducts((prev) => prev.filter((product) => product.id !== productId));
        } catch (error) {
          console.error("Error deleting product:", error);
        }
      }
    };
  
    const openAddModal = () => {
      resetNewProductData(); // Reset data for a fresh form
      setShowAddModal(true);
    };
  
    const resetNewProductData = () => {
      setNewProductData({
        productId: "",
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        personalization: "",
        upsell: 0,
        stock: 0,
        category: "",
      });
    };

  return (
    <Container>
      <Table striped bordered hover className="mt-5">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.productId}</td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>RON {product.price}</td>
              <td>{product.stock}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEditProduct(product)}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDeleteProduct(product.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button variant="primary" className="mt-3" onClick={openAddModal}>
        Add Product
      </Button>

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formProductId">
              <Form.Label>Product ID</Form.Label>
              <Form.Control
                type="text"
                name="productId"
                value={updatedProductData.productId || ""}
                onChange={handleProductInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={updatedProductData.name || ""}
                onChange={handleProductInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    name="description"
                    value={updatedProductData.description || ""}
                    onChange={handleProductInputChange}
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductImageUrl">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                    type="text"
                    name="imageUrl"
                    value={updatedProductData.imageUrl || ""}
                    onChange={handleProductInputChange}
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductPrice">
                <Form.Label>Price</Form.Label>
                <Form.Control
                    type="number"
                    name="price"
                    value={updatedProductData.price || 0}
                    onChange={handleProductInputChange}
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductStock">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                    type="number"
                    name="stock"
                    value={updatedProductData.stock || 0}
                    onChange={handleProductInputChange}
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control
                    type="text"
                    name="category"
                    value={updatedProductData.category || ""}
                    onChange={handleProductInputChange}
                />
            </Form.Group>

            {/* Add other product fields similarly */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveProductChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Add New Product</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-3" controlId="formNewProductId">
        <Form.Label>Product ID</Form.Label>
        <Form.Control
          type="text"
          name="productId"
          value={newProductData.productId}
          onChange={handleNewProductInputChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formNewProductName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={newProductData.name}
          onChange={handleNewProductInputChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formNewProductDescription">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={newProductData.description}
          onChange={handleNewProductInputChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formNewProductPrice">
        <Form.Label>Price</Form.Label>
        <Form.Control
          type="number"
          name="price"
          value={newProductData.price}
          onChange={handleNewProductInputChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formNewProductImageUrl">
        <Form.Label>Image URL</Form.Label>
        <Form.Control
          type="text"
          name="imageUrl"
          value={newProductData.imageUrl}
          onChange={handleNewProductInputChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formNewProductStock">
        <Form.Label>Stock</Form.Label>
        <Form.Control
          type="number"
          name="stock"
          value={newProductData.stock}
          onChange={handleNewProductInputChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formNewProductCategory">
        <Form.Label>Category</Form.Label>
        <Form.Control
          type="text"
          name="category"
          value={newProductData.category}
          onChange={handleNewProductInputChange}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleAddProduct}>
      Add Product
    </Button>
  </Modal.Footer>
</Modal>

    </Container>
  );
};

export default ProductsPage;
