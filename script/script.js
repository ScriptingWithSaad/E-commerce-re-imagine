// Store cart items in localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Product categories data
const productCategories = {
    electronics: ['Monitor', 'Smart Watch'],
    laptops: ['Asus Vivobook', 'Hp Intel'],
    accessories: ['Headphone', 'Gun'],
    kids: ['Fairy', 'Beblade', 'Toy Car']
};

// Initialize cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

// Search functionality
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');
    let foundProducts = false;
    let firstFoundProduct = null;

    productCards.forEach(card => {
        const productTitle = card.querySelector('.product-title').textContent.toLowerCase();
        if (searchTerm === '' || productTitle.includes(searchTerm)) {
            card.style.display = 'block';
            foundProducts = true;
            if (!firstFoundProduct) {
                firstFoundProduct = card;
            }
        } else {
            card.style.display = 'none';
        }
    });

    // Show "No products found" message if necessary
    let noProductsMsg = document.querySelector('.no-products-msg');
    if (!foundProducts) {
        if (!noProductsMsg) {
            noProductsMsg = document.createElement('div');
            noProductsMsg.className = 'no-products-msg';
            noProductsMsg.style.cssText = `
                text-align: center;
                padding: 2rem;
                font-size: 1.2rem;
                color: #666;
                grid-column: 1 / -1;
            `;
            const productsGrid = document.querySelector('.products-grid');
            productsGrid.appendChild(noProductsMsg);
        }
        noProductsMsg.textContent = `No products found matching "${searchTerm}"`;
    } else if (noProductsMsg) {
        noProductsMsg.remove();
    }

    // Scroll to first found product with smooth animation
    if (firstFoundProduct && searchTerm !== '') {
        firstFoundProduct.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const card = button.closest('.product-card');
        const productId = Date.now();
        const productName = card.querySelector('.product-title').textContent;
        const productPrice = parseFloat(card.querySelector('.current-price').textContent.replace('₹', '').replace(',', ''));
        const productImage = card.querySelector('.product-image img').src;
        
        const existingItem = cart.find(item => item.name === productName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification(`${productName} added to cart!`);
        if (isCartOpen) {
            updateCartModal();
        }
    });
});

// Enhanced cart modal with better styling
function createCartModal() {
    if (!cartModal) {
        cartModal = document.createElement('div');
        cartModal.className = 'cart-modal';
        cartModal.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            padding: 1.5rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            min-width: 350px;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 1000;
        `;
        document.body.appendChild(cartModal);
    }
    updateCartModal();
}

function updateCartModal() {
    if (!cartModal) return;
    
    if (cart.length === 0) {
        cartModal.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc;"></i>
                <p style="margin-top: 1rem; color: #666;">Your cart is empty</p>
            </div>
        `;
    } else {
        let total = 0;
        cartModal.innerHTML = `
            <h3 style="margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f0f0f0;">
                Shopping Cart
            </h3>
            ${cart.map(item => {
                total += item.price * item.quantity;
                return `
                    <div class="cart-item" style="
                        display: flex;
                        gap: 1rem;
                        margin-bottom: 1rem;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        background: #f8f9fa;
                    ">
                        <img src="${item.image}" alt="${item.name}" style="
                            width: 80px;
                            height: 80px;
                            object-fit: contain;
                            background: white;
                            padding: 0.5rem;
                            border-radius: 0.5rem;
                        ">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 0.5rem; color: #333;">${item.name}</h4>
                            <p style="margin: 0 0 0.5rem; color: #666;">₹${item.price.toLocaleString()}</p>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <button onclick="updateQuantity(${item.id}, -1)" style="
                                    padding: 0.25rem 0.5rem;
                                    border: 1px solid #ddd;
                                    border-radius: 0.25rem;
                                    background: white;
                                ">-</button>
                                <span style="min-width: 1.5rem; text-align: center;">${item.quantity}</span>
                                <button onclick="updateQuantity(${item.id}, 1)" style="
                                    padding: 0.25rem 0.5rem;
                                    border: 1px solid #ddd;
                                    border-radius: 0.25rem;
                                    background: white;
                                ">+</button>
                                <button onclick="removeFromCart(${item.id})" style="
                                    margin-left: auto;
                                    color: #dc3545;
                                    border: none;
                                    background: none;
                                    cursor: pointer;
                                "><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
            <div style="
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 2px solid #f0f0f0;
            ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <span>Subtotal:</span>
                    <strong>₹${total.toLocaleString()}</strong>
                </div>
                <button style="
                    width: 100%;
                    padding: 0.75rem;
                    background: #2874f0;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                ">Checkout</button>
            </div>
        `;
    }
}

// Cart button click handler
const cartBtn = document.querySelector('.cart-btn');
let cartModal = null;
let isCartOpen = false;

cartBtn.addEventListener('click', () => {
    if (isCartOpen) {
        if (cartModal) {
            cartModal.remove();
            cartModal = null;
        }
        isCartOpen = false;
    } else {
        createCartModal();
        isCartOpen = true;
    }
});

// Enhanced product filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const category = button.textContent.trim().toLowerCase();
        let foundProducts = false;
        
        productCards.forEach(card => {
            const productTitle = card.querySelector('.product-title').textContent;
            
            if (category === 'all') {
                card.style.display = 'block';
                foundProducts = true;
            } else {
                const categoryProducts = productCategories[category] || [];
                if (categoryProducts.includes(productTitle)) {
                    card.style.display = 'block';
                    foundProducts = true;
                } else {
                    card.style.display = 'none';
                }
            }
        });

        // Show/hide "No products available" message
        let noProductsMsg = document.querySelector('.no-products-msg');
        if (!foundProducts) {
            if (!noProductsMsg) {
                noProductsMsg = document.createElement('div');
                noProductsMsg.className = 'no-products-msg';
                noProductsMsg.style.cssText = `
                    text-align: center;
                    padding: 2rem;
                    font-size: 1.2rem;
                    color: #666;
                    grid-column: 1 / -1;
                `;
                const productsGrid = document.querySelector('.products-grid');
                productsGrid.appendChild(noProductsMsg);
            }
            noProductsMsg.textContent = `No products available in ${category} category`;
        } else if (noProductsMsg) {
            noProductsMsg.remove();
        }
    });
});

// Notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Update quantity function
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            if (isCartOpen) {
                updateCartModal();
            }
        }
    }
}

// Remove from cart function
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (isCartOpen) {
        updateCartModal();
    }
}

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize cart count on page load
updateCartCount();