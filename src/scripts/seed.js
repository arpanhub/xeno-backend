require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Customer = require('../models/customer.model');
const Order = require('../models/order.model');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123'
  }
];

const customers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    totalSpent: 5000,
    status: 'active'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '2345678901',
    totalSpent: 7500,
    status: 'active'
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '3456789012',
    totalSpent: 3000,
    status: 'inactive'
  },
  {
    name: 'Alice Brown',
    email: 'alice@example.com',
    phone: '4567890123',
    totalSpent: 12000,
    status: 'active'
  },
  {
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    phone: '5678901234',
    totalSpent: 2500,
    status: 'active'
  }
];

// Generate more customers
for (let i = 6; i <= 25; i++) {
  customers.push({
    name: `Customer ${i}`,
    email: `customer${i}@example.com`,
    phone: `${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}`,
    totalSpent: Math.floor(Math.random() * 15000),
    status: Math.random() > 0.2 ? 'active' : 'inactive'
  });
}

// Generate orders
const generateOrders = (customers) => {
  const orders = [];
  const items = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  
  customers.forEach(customer => {
    const numOrders = Math.floor(Math.random() * 3) + 1; // 1-3 orders per customer
    
    for (let i = 0; i < numOrders; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderItems = [];
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const item = items[Math.floor(Math.random() * items.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = Math.floor(Math.random() * 1000) + 100;
        orderItems.push({ name: item, quantity, price });
        totalAmount += quantity * price;
      }
      
      orders.push({
        customerId: customer._id,
        amount: totalAmount,
        status: ['pending', 'completed', 'cancelled'][Math.floor(Math.random() * 3)],
        items: orderItems
      });
    }
  });
  
  return orders;
};

// Seed database
async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log('Created users');

    // Create customers
    const createdCustomers = await Customer.create(customers);
    console.log('Created customers');

    // Generate and create orders
    const orders = generateOrders(createdCustomers);
    await Order.create(orders);
    console.log('Created orders');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 