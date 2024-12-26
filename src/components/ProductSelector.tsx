import React, { useState } from 'react';
import { Modal, Button, Table, Form, Image } from 'react-bootstrap';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

interface ProductSelectorProps {
  products: Product[];
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order | null>>;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ products, order, setOrder }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductListModal, setShowProductListModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle adding a product to the order
  const handleProductAdd = (product: Product) => {
    const productInstance = { 
      ...product, 
      instanceId: `${Date.now()}-${order.products.length}`, 
      personalization: product.personalization || ""
    };

    setOrder({
      ...order,
      products: [...order.products, productInstance],
    });

    setShowProductListModal(false);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Handle deleting a product instance from the order
  const handleProductDelete = (instanceId: string) => {
    setOrder({
      ...order,
      products: order.products.filter(product => product.instanceId !== instanceId),
    });
  };

  // Handle updating the personalization field for a product
  const handlePersonalizationChange = (instanceId: string, personalization: string) => {
    setOrder({
      ...order,
      products: order.products.map(product =>
        product.instanceId === instanceId ? { ...product, personalization } : product
      ),
    });
  };

  // Handle updating the upsell value for a product
  const handleUpsellChange = (instanceId: string, upsell: number) => {
    setOrder({
      ...order,
      products: order.products.map(product =>
        product.instanceId === instanceId ? { ...product, upsell } : product
      ),
    });
  };

  // Handle updating the price value for a product
  const handlePriceChange = (instanceId: string, price: number) => {
    setOrder({
      ...order,
      products: order.products.map(product =>
        product.instanceId === instanceId ? { ...product, price } : product
      ),
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            {/* <th>Name</th> */}
            <th>Personalization</th>
            <th>Upsell</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((product) => (
            <tr key={product.instanceId}>
              <td onClick={() => handleProductClick(product)} style={{ cursor: 'pointer' }}>{product.productId}</td>
              {/* <td onClick={() => handleProductClick(product)} style={{ cursor: 'pointer' }}>{product.name}</td> */}
              <td>
                <Form.Control
                  type="text"
                  placeholder="Enter personalization"
                  value={product.personalization || ""}
                  onChange={(e) => handlePersonalizationChange(product.instanceId!, e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  placeholder="Enter upsell"
                  value={product.upsell || 0}
                  onChange={(e) => handleUpsellChange(product.instanceId!, parseFloat(e.target.value))}
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  placeholder="Enter price"
                  value={product.price || 0}
                  onChange={(e) => handlePriceChange(product.instanceId!, parseFloat(e.target.value))}
                />
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleProductDelete(product.instanceId!)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-end mb-2">
        <Button variant="primary" onClick={() => setShowProductListModal(true)}>Add Product</Button>
      </div>

      {/* Product Details Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Image src={selectedProduct?.imageUrl} alt={selectedProduct?.name} fluid />
          <p className="mt-3">{selectedProduct?.description}</p>
    {selectedProduct?.link && <Button
      variant="dark"
      onClick={() => window.open(`${selectedProduct?.link}`, '_blank')}
    >
      View Product Page
    </Button>}
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>



      {/* Add Product Modal */}
      <Modal show={showProductListModal} onHide={() => setShowProductListModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select a Product to Add</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="search">
            <Form.Control
              type="text"
              placeholder="Search by product name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
            />
          </Form.Group>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} onClick={() => handleProductAdd(product)} style={{ cursor: 'pointer' }}>
                  <td>{product.productId}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductListModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductSelector;
