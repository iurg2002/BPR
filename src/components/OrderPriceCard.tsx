import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { Order } from '../models/Order';
import { useData } from '../context/DataContext';
import { Country } from '../models/Countries';

interface OrderPriceCardProps {
  order: Order;
}

const OrderPriceCard: React.FC<OrderPriceCardProps> = ({ order }) => {
  const { country} = useData(); // Access the data context
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
                    <td>{product.productId}</td>
                    <td>{product.price} {country == Country.RO && "RON"} {country == Country.MD && "MDL"}</td>
                  </tr>
                  {/* Display upsell if applicable */}
                  {product.upsell > 0 && (
                    <tr>
                      <td style={{ paddingLeft: '20px' }}>Upsell</td>
                      <td>{product.upsell} {country == Country.RO && "RON"} {country == Country.MD && "MDL"}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {/* Display delivery price */}
              <tr>
                <td>Delivery</td>
                <td>{order.deliveryPrice} {country == Country.RO && "RON"} {country == Country.MD && "MDL"}</td>
              </tr>

              {/* Display discount if applicable */}
              {order.discount > 0 && (
                <tr>
                  <td>Discount</td>
                  <td>-{order.discount} {country == Country.RO && "RON"} {country == Country.MD && "MDL"}</td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Total Price Footer */}
          <Card.Footer>
            <h5>Total: {order.totalPrice} {country == Country.RO && "RON"} {country == Country.MD && "MDL"}</h5>
          </Card.Footer>
        </Card.Body>
      </Card>
    )
  );
};

export default OrderPriceCard;
