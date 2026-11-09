import { DataTypes } from 'sequelize';
import sequelize from './connection.js';

export const Product = sequelize.define('Product', {
  name: DataTypes.STRING,
  price: DataTypes.DECIMAL(10, 2),
  emoji: DataTypes.STRING,
  description: DataTypes.TEXT,
  stock: DataTypes.INTEGER,
  category: DataTypes.STRING,
  brand: DataTypes.STRING,
  discount: DataTypes.INTEGER
});

export const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  customer_email: DataTypes.STRING,
  status: DataTypes.ENUM('processing', 'shipped', 'delivered'),
  total: DataTypes.DECIMAL(10, 2),
  tracking_number: DataTypes.STRING,
  estimated_delivery: DataTypes.DATE,
  delivered_date: DataTypes.DATE
});

export const OrderItem = sequelize.define('OrderItem', {
  product_name: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  price: DataTypes.DECIMAL(10, 2)
});

export const Deal = sequelize.define('Deal', {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  discount: DataTypes.STRING,
  code: DataTypes.STRING,
  valid_until: DataTypes.DATE,
  category: DataTypes.STRING,
  active: DataTypes.BOOLEAN
});

// Associations
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);