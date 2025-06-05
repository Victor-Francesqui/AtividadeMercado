const loginSection = document.getElementById('login-section');
        const catalogSection = document.getElementById('catalog-section');
        const cartSection = document.getElementById('cart-section');
        const checkoutSection = document.getElementById('checkout-section');
        const orderConfirmationSection = document.getElementById('order-confirmation-section');
        const productListDiv = document.getElementById('product-list');
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartSubtotalSpan = document.getElementById('cart-subtotal');
        const cartTotalSpan = document.getElementById('cart-total');
        const cartCountSpan = document.getElementById('cart-count');
        const authButton = document.getElementById('auth-button');
        const cartButton = document.getElementById('cart-button');
        const loginForm = document.getElementById('login-form');
        const checkoutButton = document.getElementById('checkout-button');
        const continueShoppingButton = document.getElementById('continue-shopping-button');
        const checkoutForm = document.getElementById('checkout-form');
        const checkoutOrderSummaryDiv = document.getElementById('checkout-order-summary');
        const checkoutTotalSpan = document.getElementById('checkout-total');
        const shopMoreButton = document.getElementById('shop-more-button');
        const backToCartButton = document.getElementById('back-to-cart-button');
        const notificationModal = document.getElementById('notification-modal');
        const notificationMessage = document.getElementById('notification-message');
        const loader = document.getElementById('loader');

        let allProducts = [];
        let cart = [];
        let isLoggedIn = false;

        const API_URL = 'https://fakestoreapi.com/products';
        const CART_STORAGE_KEY = 'mercadinhoDigitalCart';
        const AUTH_STORAGE_KEY = 'mercadinhoDigitalAuth';

        function showLoader() {
            loader.classList.remove('hidden');
        }

        function hideLoader() {
            loader.classList.add('hidden');
        }

        function showNotification(message, type = 'success') {
            notificationMessage.textContent = message;
            notificationModal.classList.remove('error', 'success');
            notificationModal.classList.add(type);
            notificationModal.classList.add('show');
            setTimeout(() => {
                notificationModal.classList.remove('show');
            }, 3000);
        }

        function formatCurrency(value) {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        function showSection(sectionId) {
            [loginSection, catalogSection, cartSection, checkoutSection, orderConfirmationSection].forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(sectionId).classList.remove('hidden');
        }

        function updateAuthUI() {
            if (isLoggedIn) {
                authButton.textContent = 'Logout';
                cartButton.classList.remove('hidden');
            } else {
                authButton.textContent = 'Login';
                cartButton.classList.add('hidden');
                showSection('login-section');
            }
            updateCartIcon();
        }

        function handleLogin(event) {
            event.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            if (username === 'cliente' && password === '123') {
                isLoggedIn = true;
                sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
                updateAuthUI();
                fetchProducts();
                showNotification('Login realizado com sucesso!', 'success');
            } else {
                showNotification('Usuário ou senha inválidos.', 'error');
            }
        }

        function handleLogout() {
            isLoggedIn = false;
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            updateAuthUI();
            showNotification('Logout realizado.', 'success');
        }

        async function fetchProducts() {
            showLoader();
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                allProducts = await response.json();
                displayProducts();
                showSection('catalog-section');
            } catch (error) {
                console.error('Falha ao buscar produtos:', error);
                showNotification('Erro ao carregar produtos. Tente novamente.', 'error');
            } finally {
                hideLoader();
            }
        }

        function displayProducts() {
            productListDiv.innerHTML = '';
            if (!allProducts || allProducts.length === 0) {
                productListDiv.innerHTML = '<p class="col-span-full text-center text-gray-400">Nenhum produto encontrado.</p>';
                return;
            }
            allProducts.forEach(product => {
                const productCardDiv = `
                    <div class="bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
                        <div class="image-container image-container-common product-card-image-container">
                            <img src="${product.image}" alt="${product.title}">
                        </div>
                        <div class="p-4 flex flex-col flex-1">
                            <div> 
                                <h3 class="text-lg font-semibold truncate text-gray-100" title="${product.title}">${product.title}</h3>
                                <p class="text-sm text-gray-400 mt-1 h-10 overflow-hidden">${product.description.substring(0, 50)}...</p>
                            </div>
                            <div class="mt-auto">
                                <p class="text-xl font-bold text-purple-400 mt-2">${formatCurrency(product.price)}</p>
                                <button onclick="addToCart(${product.id})" class="mt-4 w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                                    <i class="fas fa-cart-plus mr-2"></i>Adicionar ao Carrinho
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                productListDiv.innerHTML += productCardDiv;
            });
        }

        function loadCartFromLocalStorage() {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            cart = storedCart ? JSON.parse(storedCart) : [];
            updateCartDisplay();
        }

        function saveCartToLocalStorage() {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        }

        window.addToCart = function(productId) {
            if (!isLoggedIn) {
                showNotification('Você precisa estar logado para adicionar itens ao carrinho.', 'error');
                showSection('login-section');
                return;
            }
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                const cartItem = cart.find(item => item.id === productId);
                if (cartItem) {
                    cartItem.quantity++;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }
                saveCartToLocalStorage();
                updateCartDisplay();
                showNotification(`${product.title} adicionado ao carrinho!`, 'success');
            }
        }
        
        window.incrementCartItem = function(productId) {
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                cartItem.quantity++;
                saveCartToLocalStorage();
                updateCartDisplay();
            }
        }

        window.decrementCartItem = function(productId) {
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                cartItem.quantity--;
                if (cartItem.quantity <= 0) {
                    removeFromCart(productId, false);
                } else {
                    saveCartToLocalStorage();
                    updateCartDisplay();
                }
            }
        }

        window.removeFromCart = function(productId, showNotif = true) {
            const productIndex = cart.findIndex(item => item.id === productId);
            if (productIndex > -1) {
                const removedProduct = cart[productIndex];
                cart.splice(productIndex, 1);
                saveCartToLocalStorage();
                updateCartDisplay();
                if (showNotif) {
                    showNotification(`${removedProduct.title} removido do carrinho.`, 'success');
                }
            }
        }
        
        function updateCartIcon() {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountSpan.textContent = totalItems;
        }

        function updateCartDisplay() {
            cartItemsContainer.innerHTML = '';
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="text-center text-gray-400">Seu carrinho está vazio.</p>';
                cartSubtotalSpan.textContent = formatCurrency(0);
                cartTotalSpan.textContent = formatCurrency(0);
                if (checkoutButton) checkoutButton.disabled = true;
            } else {
                let subtotal = 0;
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    subtotal += itemTotal;
                    const cartItemHTML = `
                        <div class="flex items-center justify-between py-4 border-b border-gray-700 last:border-b-0">
                            <div class="flex items-center space-x-4 flex-grow"> 
                                <div class="image-container-common cart-item">
                                    <img src="${item.image}" alt="${item.title}">
                                </div>
                                <div class="flex-grow"> 
                                    <h4 class="font-semibold truncate text-gray-100" title="${item.title}">${item.title}</h4>
                                    <p class="text-sm text-gray-400">${formatCurrency(item.price)}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2 w-28 justify-center flex-shrink-0 mx-4"> 
                                <button onclick="decrementCartItem(${item.id})" class="px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600">-</button>
                                <span class="text-gray-200 w-8 text-center">${item.quantity}</span>
                                <button onclick="incrementCartItem(${item.id})" class="px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600">+</button>
                            </div>
                            <div class="text-right w-32 flex-shrink-0"> 
                                <p class="font-semibold text-gray-100">${formatCurrency(itemTotal)}</p>
                                <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-400 text-sm mt-1">Remover</button>
                            </div>
                        </div>
                    `;
                    cartItemsContainer.innerHTML += cartItemHTML;
                });
                cartSubtotalSpan.textContent = formatCurrency(subtotal);
                cartTotalSpan.textContent = formatCurrency(subtotal);
                 if (checkoutButton) checkoutButton.disabled = false;
            }
            updateCartIcon();
        }

        function displayCheckout() {
            if (cart.length === 0) {
                showNotification('Seu carrinho está vazio. Adicione itens antes de ir para o checkout.', 'error');
                showSection('catalog-section');
                return;
            }
            checkoutOrderSummaryDiv.innerHTML = '';
            let total = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                const summaryItemHTML = `
                    <div class="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                        <div class="flex items-center space-x-2">
                             <div class="image-container image-container-common" id="checkout-order-summary-image-container">
                                <img src="${item.image}" alt="${item.title}">
                            </div>
                            <div>
                                <p class="text-sm font-medium truncate w-40 md:w-auto text-gray-200" title="${item.title}">${item.title} (x${item.quantity})</p>
                                <p class="text-xs text-gray-400">${formatCurrency(item.price)} cada</p>
                            </div>
                        </div>
                        <p class="text-sm font-semibold text-gray-200">${formatCurrency(itemTotal)}</p>
                    </div>
                `;
                checkoutOrderSummaryDiv.innerHTML += summaryItemHTML;
            });
            checkoutTotalSpan.textContent = formatCurrency(total);
            showSection('checkout-section');
        }

        function handleCheckoutSubmit(event) {
            event.preventDefault();
            const formData = new FormData(checkoutForm);
            const deliveryInfo = {
                fullName: formData.get('fullName'),
                address: formData.get('address'),
                city: formData.get('city'),
                postalCode: formData.get('postalCode'),
                paymentMethod: formData.get('paymentMethod')
            };

            console.log('Informações do Pedido:', {
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                delivery: deliveryInfo
            });

            cart = [];
            saveCartToLocalStorage();
            updateCartDisplay();
            showSection('order-confirmation-section');
            showNotification('Pedido confirmado com sucesso!', 'success');
            checkoutForm.reset();
        }

        loginForm.addEventListener('submit', handleLogin);

        authButton.addEventListener('click', () => {
            if (isLoggedIn) {
                handleLogout();
            } else {
                showSection('login-section');
            }
        });

        cartButton.addEventListener('click', () => {
            if (isLoggedIn) {
                showSection('cart-section');
            } else {
                showNotification('Faça login para ver seu carrinho.', 'error');
                showSection('login-section');
            }
        });
        
        if(checkoutButton) {
            checkoutButton.addEventListener('click', displayCheckout);
        }

        if(continueShoppingButton) {
            continueShoppingButton.addEventListener('click', () => showSection('catalog-section'));
        }
        
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);

        if(shopMoreButton) {
            shopMoreButton.addEventListener('click', () => {
                 if (isLoggedIn) {
                    fetchProducts();
                } else {
                    showSection('login-section');
                }
            });
        }

        if(backToCartButton) {
            backToCartButton.addEventListener('click', () => showSection('cart-section'));
        }

        function init() {
            loadCartFromLocalStorage();
            const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
            if (storedAuth === 'true') {
                isLoggedIn = true;
                fetchProducts();
            } else {
                isLoggedIn = false;
                showSection('login-section');
            }
            updateAuthUI();
        }

        document.addEventListener('DOMContentLoaded', init);
