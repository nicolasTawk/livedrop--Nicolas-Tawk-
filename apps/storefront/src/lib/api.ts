// Real API functions
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://livedrop-nicolas-tawk.onrender.com';
export const API_BASE = API_BASE_URL;

type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  tags: string[];
  stock: number;
  description?: string;
  category?: string;
}

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'

export async function listProducts(search = '', tag = '', sort = 'name', page = 1, limit = 20): Promise<{ products: Product[], pagination: any }> {
  const params = new URLSearchParams({
    search,
    tag,
    sort,
    page: page.toString(),
    limit: limit.toString()
  });

  const response = await fetch(`${API_BASE_URL}/api/products?${params}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!response.ok) throw new Error('Product not found');
  return response.json();
}

export async function getCustomerByEmail(email: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/customers?email=${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error('Customer not found');
  return response.json();
}

export async function createCustomer(customerData: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  if (!response.ok) throw new Error('Failed to create customer');
  return response.json();
}

export async function placeOrder(order: { customerId: string, items: any[] }): Promise<{ orderId: string }> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to place order');
  }

  const result = await response.json();
  return { orderId: result._id };
}

export async function getOrderStatus(orderId: string): Promise<{ orderId: string, status: OrderStatus, carrier?: string, eta?: string }> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
  if (!response.ok) throw new Error('Order not found');

  const order = await response.json();
  return {
    orderId: order._id,
    status: order.status,
    carrier: order.carrier,
    eta: order.estimatedDelivery
  };
}

export async function getCustomerOrders(customerId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/orders?customerId=${customerId}`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

// Assistant
export async function askAssistant(message: string, context: any = {}): Promise<{ text: string; intent?: string; citations?: string[] }> {
  const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context })
  })
  if (!response.ok) throw new Error('Assistant request failed')
  return response.json()
}
