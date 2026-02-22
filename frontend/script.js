const menuEl = document.getElementById('menu');
const cartCountEl = document.getElementById('cartCount');

// 🛒 ตะกร้า
let cart = {};

// นับจำนวนรวม
function updateCartCount() {
  let total = 0;
  for (let id in cart) {
    total += cart[id].qty;
  }
  cartCountEl.innerText = total;
}

// เพิ่มสินค้าเข้าตะกร้า
function addToCart(food) {
  if (cart[food.id]) {
    cart[food.id].qty += 1;
  } else {
    cart[food.id] = {
      id: food.id,
      name: food.name || food.NAME,
      price: food.price,
      image: food.image,
      qty: 1
    };
  }

  updateCartCount();
  console.log(cart); // ดูตะกร้าใน console
}

// ดึงเมนูจาก backend
fetch('http://localhost:3000/foods')
  .then(res => res.json())
  .then(foods => {
    foods.forEach(food => {
      const card = document.createElement('div');
      card.className = 'food-card';

      card.innerHTML = `
        <img src="${food.image}" />
        <div class="food-info">
          <h3>${food.name || food.NAME}</h3>
          <div class="price">฿${food.price}</div>
          <button class="add-btn">➕ เพิ่ม</button>
        </div>
      `;

      card.querySelector('.add-btn').onclick = () => {
        addToCart(food);
      };

      menuEl.appendChild(card);
    });
  });

// คลิกแถบล่าง
function goToOrder() {
  if (Object.keys(cart).length === 0) {
    alert('ยังไม่ได้เลือกเมนู');
    return;
  }

  // เก็บตะกร้าไว้
  localStorage.setItem('cart', JSON.stringify(cart));

  // ไปหน้า order
  window.location.href = 'order.html';
}