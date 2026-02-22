const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

/* =======================
   เช็ก backend
======================= */
app.get('/', (req, res) => {
  res.send('Backend running');
});

/* =======================
   USER: เมนูที่ขายได้
======================= */
app.get('/foods', (req, res) => {
  db.query(
    'SELECT id, NAME AS name, price, image FROM foods WHERE available = 1',
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

/* =======================
   ADMIN: ดูเมนูทั้งหมด
======================= */
app.get('/admin/foods', (req, res) => {
  db.query(
    'SELECT id, NAME AS name, price, image, available FROM foods',
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

/* =======================
   ADMIN: เพิ่มเมนู
======================= */
app.post('/admin/foods', (req, res) => {
  const { name, price, image } = req.body;

  if (!name || !price || !image) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });
  }

  db.query(
    'INSERT INTO foods (NAME, price, image, available) VALUES (?, ?, ?, 1)',
    [name, price, image],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

/* =======================
   ADMIN: เปิด / ปิดเมนู
======================= */
app.put('/admin/foods/:id', (req, res) => {
  const { available } = req.body;

  db.query(
    'UPDATE foods SET available = ? WHERE id = ?',
    [available, req.params.id],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

/* =======================
   ADMIN: ลบเมนู
======================= */
app.delete('/admin/foods/:id', (req, res) => {
  db.query(
    'DELETE FROM foods WHERE id = ?',
    [req.params.id],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

/* =======================
   USER: สร้างออเดอร์
======================= */
app.post('/orders', (req, res) => {
  const items = req.body.items;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'no items' });
  }

  db.query(
    'INSERT INTO orders (status) VALUES ("pending")',
    (err, result) => {
      if (err) return res.status(500).json(err);

      const orderId = result.insertId;

      const values = items.map(i => [
        orderId,
        i.foodId,
        i.qty
      ]);

      db.query(
        'INSERT INTO order_items (order_id, food_id, quantity) VALUES ?',
        [values],
        err2 => {
          if (err2) return res.status(500).json(err2);
          res.json({ success: true, orderId });
        }
      );
    }
  );
});

/* =======================
   ADMIN: ดูออเดอร์ทั้งหมด
======================= */
app.get('/admin/orders', (req, res) => {
  const sql = `
    SELECT 
      o.id AS order_id,
      o.status,
      o.created_at,
      f.NAME AS food_name,
      oi.quantity
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN foods f ON oi.food_id = f.id
    ORDER BY o.id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);

    // รวมข้อมูลให้เป็น order เดียวกัน
    const orders = {};

    rows.forEach(r => {
      if (!orders[r.order_id]) {
        orders[r.order_id] = {
          id: r.order_id,
          status: r.status,
          created_at: r.created_at,
          items: []
        };
      }

      orders[r.order_id].items.push({
        name: r.food_name,
        quantity: r.quantity
      });
    });

    res.json(Object.values(orders));
  });
});

/* =======================
   ADMIN: เปลี่ยนสถานะออเดอร์
======================= */
app.put('/admin/orders/:id', (req, res) => {
  const { status } = req.body;

  db.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, req.params.id],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

/* ======================= */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
/* =======================
   USER: ดูสถานะออเดอร์
======================= */
app.get('/orders/:id', (req, res) => {
  db.query(
    'SELECT id, status FROM orders WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) {
        return res.status(404).json({ message: 'order not found' });
      }
      res.json(result[0]);
    }
  );
});