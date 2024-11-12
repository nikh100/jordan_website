let cart = [];
let selectedSize = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchShoes();
    setupCartModal();
    setupShoeModal();
    loadCart();
});

async function fetchShoes() {
    try {
        const response = await fetch('/api/shoes');
        const shoes = await response.json();
        displayShoes(shoes);
    } catch (error) {
        console.error('Error fetching shoes:', error);
    }
}

function displayShoes(shoes) {
    const container = document.getElementById('shoes-container');
    container.innerHTML = '';

    shoes.forEach(shoe => {
        const shoeCard = document.createElement('div');
        shoeCard.className = 'shoe-card';
        shoeCard.innerHTML = `
            <img src="${shoe.image}" alt="${shoe.name}">
            <div class="shoe-info">
                <h3>${shoe.name}</h3>
                <p class="price">$${shoe.price}</p>
                <p>${shoe.description}</p>
                <div class="rating">
                    ${displayRating(shoe.rating)}
                </div>
                <button onclick="showShoeDetails(${shoe.id})">View Details</button>
            </div>
        `;
        container.appendChild(shoeCard);
    });
}

function displayRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

async function showShoeDetails(shoeId) {
    try {
        const response = await fetch(`/api/shoes/${shoeId}`);
        const shoe = await response.json();
        
        const modal = document.getElementById('shoe-modal');
        const detailsContainer = document.getElementById('shoe-details');
        
        detailsContainer.innerHTML = `
            <div class="product-image">
                <img src="${shoe.image}" alt="${shoe.name}">
            </div>
            <div class="product-info">
                <h2>${shoe.name}</h2>
                <p class="price">$${shoe.price}</p>
                <div class="rating">
                    ${displayRating(shoe.rating)}
                    <span>(${shoe.reviews.length} reviews)</span>
                </div>
                <p>${shoe.description}</p>
                <div class="product-details">
                    <p><strong>Color:</strong> ${shoe.color}</p>
                    <p><strong>Release Date:</strong> ${new Date(shoe.releaseDate).toLocaleDateString()}</p>
                </div>
                <div class="size-selector">
                    <h4>Select Size:</h4>
                    <div class="size-buttons">
                        ${shoe.sizes.map(size => `
                            <button class="size-btn" data-size="${size}">${size}</button>
                        `).join('')}
                    </div>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${shoe.id})" disabled>Add to Cart</button>
                
                <h3>Features</h3>
                <ul class="features-list">
                    ${shoe.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                
                <div class="reviews-section">
                    <h3>Reviews</h3>
                    ${shoe.reviews.map(review => `
                        <div class="review">
                            <div class="review-header">
                                <strong>${review.user}</strong>
                                <div class="rating">${displayRating(review.rating)}</div>
                            </div>
                            <p>${review.comment}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Setup size selection
        const sizeButtons = detailsContainer.querySelectorAll('.size-btn');
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedSize = parseFloat(btn.dataset.size);
                detailsContainer.querySelector('.add-to-cart-btn').disabled = false;
            });
        });

        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching shoe details:', error);
    }
}

function setupShoeModal() {
    const modal = document.getElementById('shoe-modal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.onclick = function() {
        modal.style.display = 'none';
        selectedSize = null;
    }

    window.onclick = function(e) {
        if (e.target == modal) {
            modal.style.display = 'none';
            selectedSize = null;
        }
    }
}

async function addToCart(shoeId) {
    if (!selectedSize) {
        alert('Please select a size');
        return;
    }

    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shoeId, size: selectedSize })
        });
        
        if (response.ok) {
            const updatedCart = await response.json();
            updateCart(updatedCart);
            document.getElementById('shoe-modal').style.display = 'none';
            selectedSize = null;
            alert('Added to cart!');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        const cartItems = await response.json();
        updateCart(cartItems);
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function updateCart(cartItems) {
    cart = cartItems;
    document.getElementById('cart-count').textContent = cart.length;
    displayCartItems();
    updateCartTotal();
}

function displayCartItems() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h3>${item.name}</h3>
                <p>Size: ${item.size}</p>
                <p>$${item.price}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.cartId})">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });
}

async function removeFromCart(cartId) {
    try {
        const response = await fetch(`/api/cart/${cartId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const updatedCart = await response.json();
            updateCart(updatedCart);
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').textContent = total;
}

function setupCartModal() {
    const modal = document.getElementById('cart-modal');
    const cartIcon = document.getElementById('cart-icon');
    const closeBtn = modal.querySelector('.close');

    cartIcon.onclick = function(e) {
        e.preventDefault();
        modal.style.display = 'block';
    }

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(e) {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.onclick = checkout;
}

async function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST'
        });
        
        if (response.ok) {
            alert('Order placed successfully! Thank you for your purchase.');
            updateCart([]);
            document.getElementById('cart-modal').style.display = 'none';
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('Error processing your order. Please try again.');
    }
}