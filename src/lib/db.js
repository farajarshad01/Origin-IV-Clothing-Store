import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Open or create the database in the root folder
const dbPath = path.resolve(process.cwd(), 'dev.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize database schema
export function initDB() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'customer', -- 'customer' or 'admin'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'jacket', 'shirt', 'pants', 'accessory'
      price REAL NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT,
      customizable INTEGER DEFAULT 1 -- 1 for true, 0 for false
    );

    CREATE TABLE IF NOT EXISTS designs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      base_garment TEXT NOT NULL, -- e.g., 'denim-jacket', 'oversized-tee', 'carpenter-pants', 'tote-bag'
      base_color TEXT NOT NULL,
      art_style TEXT NOT NULL, -- design graphic overlay
      custom_text TEXT,
      text_placement TEXT,
      status TEXT DEFAULT 'saved', -- 'saved' or 'ordered'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'sketching', 'painting', 'curing', 'shipped'
      shipping_address TEXT NOT NULL,
      tracking_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      design_id INTEGER, -- NULL if standard non-custom product
      product_id INTEGER, -- NULL if customized item (or links back to base product)
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE SET NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS commissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      apparel_type TEXT NOT NULL,
      description TEXT NOT NULL,
      reference_image_url TEXT,
      estimated_price REAL,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed default products if empty
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (name, type, price, image_url, description, customizable)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertProduct.run(
      'Origin IV Heavy Denim Jacket',
      'jacket',
      189.00,
      '/assets/products/denim_jacket.jpg',
      '14oz heavy raw denim jacket. Boxy vintage fit. Perfect canvas for hand-painting.',
      1
    );
    insertProduct.run(
      'Origin IV Boxy Heavyweight Tee',
      'shirt',
      65.00,
      '/assets/products/heavyweight_tee.jpg',
      '260gsm organic combed cotton tee. Dropped shoulders, thick mock neck collar.',
      1
    );
    insertProduct.run(
      'Origin IV Double-Knee Carpenter Pants',
      'pants',
      145.00,
      '/assets/products/carpenter_pants.jpg',
      'Heavyweight cotton duck canvas work pants. Hammer loop, relaxed fit.',
      1
    );
    insertProduct.run(
      'Origin IV Canvas Tote Bag',
      'accessory',
      45.00,
      '/assets/products/canvas_tote.jpg',
      'Thick raw canvas tote bag with reinforced handles and interior zip pocket.',
      1
    );
    insertProduct.run(
      'Origin IV Distressed Ribbed Beanie',
      'accessory',
      35.00,
      '/assets/products/ribbed_beanie.jpg',
      'Double layered ribbed knit beanie with heavy distressing along the cuff.',
      0
    );
    console.log('Seeded default products.');
  }

  // Seed default users if empty (admin and test customer)
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `);

    // Create Admin User (password: originivadmin)
    const adminPasswordHash = bcrypt.hashSync('originivadmin', 10);
    insertUser.run('admin@originiv.com', adminPasswordHash, 'Origin IV Admin', 'admin');

    // Create Test Customer User (password: customer123)
    const customerPasswordHash = bcrypt.hashSync('customer123', 10);
    insertUser.run('customer@originiv.com', customerPasswordHash, 'John Doe', 'customer');

    console.log('Seeded default users (admin@originiv.com, customer@originiv.com).');
  }
}

// Call initDB to run schema setups
initDB();

export default db;
