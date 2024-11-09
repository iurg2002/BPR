import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { Order } from '../models/Order';

interface OrderPriceCardProps {
  order: Order;
}

const OrderPriceCard: React.FC<OrderPriceCardProps> = ({ order }) => {
  return (
    order && (
      <Card>
        <Card.Body>
          <Card.Title>Order Info</Card.Title>

          <Table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {/* Display each product and its price */}
              {order.products.map((product) => (
                <React.Fragment key={product.id}>
                  <tr>
                    <td>{product.name}</td>
                    <td>{product.price} RON</td>
                  </tr>
                  {/* Display upsell if applicable */}
                  {product.upsell > 0 && (
                    <tr>
                      <td style={{ paddingLeft: '20px' }}>Upsell</td>
                      <td>{product.upsell} RON</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {/* Display delivery price */}
              <tr>
                <td>Delivery</td>
                <td>{order.deliveryPrice} RON</td>
              </tr>

              {/* Display discount if applicable */}
              {order.discount > 0 && (
                <tr>
                  <td>Discount</td>
                  <td>-{order.discount} RON</td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Total Price Footer */}
          <Card.Footer>
            <h5>Total: {order.totalPrice} RON</h5>
          </Card.Footer>
        </Card.Body>
      </Card>
    )
  );
};

export default OrderPriceCard;
