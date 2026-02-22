const orderListEl = document.getElementById('orderList');
const totalPriceEl = document.getElementById('totalPrice');

// ดึงตะกร้า
let cart = JSON.parse(localStorage.getItem('cart')) || {};

function renderOrder() {
  orderListEl.innerHTML = '';
  let total = 0;

  Object.values(cart).forEach(item => {
    total += item.price * item.qty;

    const row = document.createElement('div');
    row.className = 'order-item';

    row.innerHTML = `
      <img src="${item.image}" />
      <div class="order-info">
        <h3>${item.name}</h3>
        <div class="order-price">฿${item.price}</div>
        <div class="qty-control">
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <span>x${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem(${item.id})">✕</button>
    `;

    orderListEl.appendChild(row);
  });

  totalPriceEl.innerText = total;
  localStorage.setItem('cart', JSON.stringify(cart));
}

function changeQty(id, diff) {
  cart[id].qty += diff;
  if (cart[id].qty <= 0) {
    delete cart[id];
  }
  renderOrder();
}

function removeItem(id) {
  delete cart[id];
  renderOrder();
}

function goBack() {
  window.location.href = 'index.html';
}

/* =======================
   ยืนยันออเดอร์
======================= */
async function confirmOrder() {
  if (Object.keys(cart).length === 0) {
    alert('ไม่มีรายการอาหาร');
    return;
  }

  const items = Object.values(cart).map(i => ({
    foodId: i.id,
    qty: i.qty
  }));

  try {
    const res = await fetch('http://localhost:3000/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items })
    });

    const data = await res.json();

    if (!res.ok) {
      alert('สั่งอาหารไม่สำเร็จ');
      return;
    }

    // ล้างตะกร้า
    localStorage.removeItem('cart');

    // เก็บ orderId ไว้ให้หน้า preparing ใช้
    localStorage.setItem('orderId', data.orderId);

    // ไปหน้ากำลังเตรียมอาหาร
    window.location.href = 'preparing.html';

  } catch (err) {
    console.error(err);
    alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
  }
}

renderOrder();