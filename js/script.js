document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Sticky Navbar
    const navbar = document.getElementById('navbar');
    // We only apply this complex logic if it has absolute-top class (like home page)
    if (navbar && navbar.classList.contains('absolute-top')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('glass', 'text-gray-900');
                navbar.classList.remove('bg-transparent', 'text-white', 'mix-blend-difference');

                // Update specific internal elements
                const brandLogo = navbar.querySelector('a.text-3xl');
                if (brandLogo) {
                    brandLogo.classList.remove('mix-blend-difference', 'text-white');
                    brandLogo.classList.add('text-gray-900');
                }

                const icons = navbar.querySelector('.mix-blend-difference');
                if (icons) {
                    icons.classList.remove('mix-blend-difference', 'text-white');
                    icons.classList.add('text-gray-900');
                }

            } else {
                navbar.classList.remove('glass', 'text-gray-900');
                navbar.classList.add('bg-transparent', 'text-white');

                const brandLogo = navbar.querySelector('a.text-3xl');
                if (brandLogo) {
                    brandLogo.classList.add('mix-blend-difference');
                }
            }
        });
    }

    // Simple scroll animation observer
    const faders = document.querySelectorAll('.fade-in-section');
    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('fade-in');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Shop Page Filtering and Sorting
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        const categoryFilters = document.querySelectorAll('.category-filter');
        const priceFilter = document.getElementById('price-filter');
        const priceDisplay = document.getElementById('price-display');
        const sortFilter = document.getElementById('sort-filter');
        const searchFilter = document.getElementById('search-filter');
        const applyBtn = document.getElementById('apply-filters-btn');

        const products = Array.from(productGrid.querySelectorAll('.product-card'));

        // Store original order for default sorting
        products.forEach((p, index) => {
            p.dataset.index = index;
        });

        function updateFilters() {
            // 1. Category Filter
            const selectedCategories = Array.from(categoryFilters)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            let showAllCategories = selectedCategories.includes('all') || selectedCategories.length === 0;

            // 2. Price Filter
            const maxPrice = parseInt(priceFilter.value);

            // Search Filter
            const searchQuery = searchFilter ? searchFilter.value.toLowerCase().trim() : '';

            let filteredProducts = products.filter(product => {
                const category = product.dataset.category;
                const price = parseInt(product.dataset.price);
                const titleElement = product.querySelector('h3');
                const title = titleElement ? titleElement.textContent.toLowerCase() : '';

                const categoryMatch = showAllCategories || selectedCategories.includes(category);
                const priceMatch = price <= maxPrice;
                const searchMatch = searchQuery === '' || title.includes(searchQuery);

                return categoryMatch && priceMatch && searchMatch;
            });

            // 3. Sorting
            const sortValue = sortFilter.value;
            filteredProducts.sort((a, b) => {
                if (sortValue === 'price-low') {
                    return parseInt(a.dataset.price) - parseInt(b.dataset.price);
                } else if (sortValue === 'price-high') {
                    return parseInt(b.dataset.price) - parseInt(a.dataset.price);
                } else if (sortValue === 'popularity') {
                    return parseInt(b.dataset.popularity) - parseInt(a.dataset.popularity);
                } else if (sortValue === 'latest') {
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
                } else {
                    return parseInt(a.dataset.index) - parseInt(b.dataset.index);
                }
            });

            // 4. Update UI
            productGrid.innerHTML = '';

            if (filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    productGrid.appendChild(product);
                });
            } else {
                productGrid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500 font-semibold">No products matches the selected criteria.</div>';
            }
        }

        // Checkbox logic for "All" vs "Specific Categories"
        categoryFilters.forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (e.target.value === 'all' && e.target.checked) {
                    categoryFilters.forEach(c => { if (c.value !== 'all') c.checked = false; });
                } else if (e.target.value !== 'all' && e.target.checked) {
                    const allCb = Array.from(categoryFilters).find(c => c.value === 'all');
                    if (allCb) allCb.checked = false;
                }
                updateFilters();
            });
        });

        // Price display update
        priceFilter.addEventListener('input', () => {
            priceDisplay.textContent = 'Rs. ' + parseInt(priceFilter.value).toLocaleString() + '+';
        });

        // Trigger filters instantly
        priceFilter.addEventListener('change', updateFilters);
        sortFilter.addEventListener('change', updateFilters);
        if (searchFilter) {
            searchFilter.addEventListener('input', updateFilters);
        }

        // Support apply button if the user clicks it instead
        if (applyBtn) {
            applyBtn.addEventListener('click', updateFilters);
        }

        // Initialize state on load
        const urlParams = new URLSearchParams(window.location.search);
        
        // 1. Search Query
        const searchQueryParam = urlParams.get('q');
        if (searchQueryParam && searchFilter) {
            searchFilter.value = searchQueryParam;
        }

        // 2. Category Filter from URL
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            categoryFilters.forEach(cb => {
                if (cb.value === categoryParam) {
                    cb.checked = true;
                    // Uncheck "all" if a specific category is selected
                    const allCb = Array.from(categoryFilters).find(c => c.value === 'all');
                    if (allCb) allCb.checked = false;
                } else if (cb.value === 'all') {
                    cb.checked = false;
                }
            });
        }

        // 3. Sort Filter from URL
        const sortParam = urlParams.get('sort');
        if (sortParam && sortFilter) {
            // Find if the sortParam exists in options
            const options = Array.from(sortFilter.options).map(opt => opt.value);
            if (options.includes(sortParam)) {
                sortFilter.value = sortParam;
            }
        }

        updateFilters();
    }

    // --- Global Search Modal Logic ---
    let searchModal = document.getElementById('global-search-modal');
    if (!searchModal) {
        searchModal = document.createElement('div');
        searchModal.id = 'global-search-modal';
        searchModal.className = 'fixed inset-0 z-[100] hidden bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 opacity-0';
        searchModal.innerHTML = `
            <div class="relative w-full max-w-3xl transform -translate-y-10 transition-transform duration-300" id="search-modal-content">
                <button id="close-search-modal" class="absolute -top-12 right-0 text-gray-400 hover:text-brand-950 text-4xl transition">&times;</button>
                <input type="text" id="global-search-input" class="w-full text-3xl md:text-5xl font-black text-brand-950 bg-transparent border-b-2 border-brand-950 focus:outline-none placeholder-gray-400 py-4" placeholder="What are you looking for?">
                <p class="text-gray-400 mt-4 text-xs font-bold uppercase tracking-widest">Press Enter to Search</p>
            </div>
        `;
        document.body.appendChild(searchModal);
    }

    const globalSearchInput = document.getElementById('global-search-input');
    const searchModalContent = document.getElementById('search-modal-content');
    const closeSearchBtn = document.getElementById('close-search-modal');

    // Attach to all top nav search icons
    const searchIcons = document.querySelectorAll('.fa-search.text-xl');
    searchIcons.forEach(icon => {
        const link = icon.closest('a');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                searchModal.classList.remove('hidden');
                setTimeout(() => {
                    searchModal.classList.remove('opacity-0');
                    searchModalContent.classList.remove('-translate-y-10');
                    globalSearchInput.focus();
                }, 10);
            });
        }
    });

    function closeSearch() {
        searchModal.classList.add('opacity-0');
        searchModalContent.classList.add('-translate-y-10');
        setTimeout(() => {
            searchModal.classList.add('hidden');
        }, 300);
    }

    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', closeSearch);
    }

    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearch();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !searchModal.classList.contains('hidden')) {
            closeSearch();
        }
    });

    globalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = globalSearchInput.value.trim();
            if (query) {
                window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
            }
        }
    });

    // --- Cart System Logic ---
    function initCart() {
        let cart = JSON.parse(localStorage.getItem('lehan_cart')) || [];

        // 1. Update Global Cart Count
        function updateCartCount() {
            const countElements = document.querySelectorAll('.global-cart-count');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            countElements.forEach(el => {
                el.textContent = totalItems;
            });
        }

        function saveCart() {
            localStorage.setItem('lehan_cart', JSON.stringify(cart));
            updateCartCount();
            renderCartDrawer();
            if (window.location.pathname.includes('cart.html')) {
                renderCartPage();
            }
        }

        // 2. Cart Side Drawer UI Integration
        let cartDrawer = document.getElementById('cart-drawer');
        let cartOverlay = document.getElementById('cart-overlay');

        if (!cartDrawer) {
            cartOverlay = document.createElement('div');
            cartOverlay.id = 'cart-overlay';
            cartOverlay.className = 'fixed inset-0 bg-black/50 z-[100] hidden opacity-0 transition-opacity duration-300 backdrop-blur-sm';
            document.body.appendChild(cartOverlay);

            cartDrawer = document.createElement('div');
            cartDrawer.id = 'cart-drawer';
            cartDrawer.className = 'fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[110] transform translate-x-full transition-transform duration-300 shadow-2xl flex flex-col';
            cartDrawer.innerHTML = `
                <div class="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                    <h2 class="text-xl font-black uppercase tracking-widest text-brand-950">Your Cart</h2>
                    <button id="close-cart-btn" class="text-gray-400 hover:text-brand-950 text-2xl transition"><i class="fas fa-times"></i></button>
                </div>
                <div id="cart-drawer-items" class="flex-1 overflow-y-auto p-6 space-y-6">
                    <!-- Items will be injected here -->
                </div>
                <div class="p-6 border-t border-gray-100 bg-white">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-sm font-bold uppercase text-gray-500 tracking-wider">Subtotal</span>
                        <span id="cart-drawer-total" class="text-2xl font-black text-brand-950">Rs. 0</span>
                    </div>
                    <a href="cart.html" class="block w-full text-center border-2 border-brand-950 text-brand-950 font-bold py-3 uppercase text-sm tracking-wider hover:bg-gray-50 transition mb-3">View Cart Document</a>
                    <button class="w-full bg-brand-950 text-white font-bold py-3 uppercase text-sm tracking-wider hover:bg-brand-500 transition shadow-lg">Checkout</button>
                </div>
            `;
            document.body.appendChild(cartDrawer);

            document.getElementById('close-cart-btn').addEventListener('click', closeCart);
            cartOverlay.addEventListener('click', closeCart);
        }

        function openCart() {
            cartOverlay.classList.remove('hidden');
            setTimeout(() => {
                cartOverlay.classList.remove('opacity-0');
                cartDrawer.classList.remove('translate-x-full');
            }, 10);
        }

        function closeCart() {
            cartOverlay.classList.add('opacity-0');
            cartDrawer.classList.add('translate-x-full');
            setTimeout(() => {
                cartOverlay.classList.add('hidden');
            }, 300);
        }

        function parsePrice(priceStr) {
            return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        }

        function formatPrice(price) {
            return 'Rs. ' + price.toLocaleString();
        }

        function renderCartDrawer() {
            const drawerItemsContainer = document.getElementById('cart-drawer-items');
            const drawerTotal = document.getElementById('cart-drawer-total');
            
            if (cart.length === 0) {
                drawerItemsContainer.innerHTML = '<div class="text-center text-gray-400 mt-20"><i class="fas fa-shopping-basket text-5xl mb-6 text-gray-200"></i><p class="font-medium">Your cart is currently empty.</p></div>';
                drawerTotal.textContent = 'Rs. 0';
                return;
            }

            let html = '';
            let total = 0;

            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                html += `
                    <div class="flex gap-4">
                        <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover rounded-sm border border-gray-100">
                        <div class="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h4 class="text-sm font-bold text-gray-900 leading-tight">${item.name}</h4>
                                <p class="text-brand-950 font-extrabold mt-1.5">${formatPrice(item.price)}</p>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center border border-gray-200 rounded-sm">
                                    <button class="px-2.5 py-1 text-gray-500 hover:text-brand-950 bg-gray-50 transition" onclick="window.updateCartItem(${index}, -1)">-</button>
                                    <span class="px-3 text-xs font-bold">${item.quantity}</span>
                                    <button class="px-2.5 py-1 text-gray-500 hover:text-brand-950 bg-gray-50 transition" onclick="window.updateCartItem(${index}, 1)">+</button>
                                </div>
                                <button class="text-gray-400 text-sm hover:text-red-500 transition" onclick="window.removeCartItem(${index})"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            });

            drawerItemsContainer.innerHTML = html;
            drawerTotal.textContent = formatPrice(total);
        }

        function renderCartPage() {
            const pageItemsContainer = document.getElementById('cart-page-items');
            const pageSubtotal = document.getElementById('cart-page-subtotal');
            const pageTotal = document.getElementById('cart-page-total');
            
            if (!pageItemsContainer) return;

            if (cart.length === 0) {
                pageItemsContainer.innerHTML = `
                    <div class="text-center py-16">
                        <i class="fas fa-shopping-bag text-6xl text-gray-200 mb-6"></i>
                        <h2 class="text-2xl font-bold text-brand-950 mb-4">Your cart is empty</h2>
                        <a href="shop.html" class="inline-block bg-brand-950 text-white font-bold py-3 px-8 uppercase text-sm tracking-wider hover:bg-brand-500 transition shadow-md">Start Shopping</a>
                    </div>
                `;
                pageSubtotal.textContent = 'Rs. 0';
                pageTotal.textContent = 'Rs. 0';
                return;
            }

            let html = `
                <div class="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <div class="col-span-6">Product</div>
                    <div class="col-span-2 text-center">Price</div>
                    <div class="col-span-2 text-center">Quantity</div>
                    <div class="col-span-2 text-right">Total</div>
                </div>
            `;
            
            let total = 0;

            cart.forEach((item, index) => {
                const lineTotal = item.price * item.quantity;
                total += lineTotal;
                html += `
                    <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-6 border-b border-gray-100 last:border-0">
                        <div class="col-span-12 sm:col-span-6 flex gap-6 items-center">
                            <button class="text-gray-300 hover:text-red-500 transition" onclick="window.removeCartItem(${index})"><i class="fas fa-times text-lg"></i></button>
                            <img src="${item.image}" alt="${item.name}" class="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-sm border border-gray-100 shadow-sm">
                            <div>
                                <h4 class="text-base font-bold text-gray-900">${item.name}</h4>
                            </div>
                        </div>
                        <div class="col-span-4 sm:col-span-2 text-left sm:text-center mt-2 sm:mt-0">
                            <span class="sm:hidden text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Price</span>
                            <span class="font-medium text-gray-700">${formatPrice(item.price)}</span>
                        </div>
                        <div class="col-span-4 sm:col-span-2 flex justify-start sm:justify-center mt-2 sm:mt-0">
                            <div>
                                <span class="sm:hidden text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Quantity</span>
                                <div class="flex items-center border border-gray-200 rounded-sm inline-flex">
                                    <button class="px-3 py-1.5 text-gray-500 hover:text-brand-950 transition bg-gray-50" onclick="window.updateCartItem(${index}, -1)">-</button>
                                    <span class="px-4 text-sm font-bold">${item.quantity}</span>
                                    <button class="px-3 py-1.5 text-gray-500 hover:text-brand-950 transition bg-gray-50" onclick="window.updateCartItem(${index}, 1)">+</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-4 sm:col-span-2 text-right mt-2 sm:mt-0">
                            <span class="sm:hidden text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Total</span>
                            <span class="font-black text-brand-950 text-lg">${formatPrice(lineTotal)}</span>
                        </div>
                    </div>
                `;
            });

            pageItemsContainer.innerHTML = html;
            pageSubtotal.textContent = formatPrice(total);
            pageTotal.textContent = formatPrice(total);
        }

        // Global functions for inline onclick handlers
        window.updateCartItem = function(index, change) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            saveCart();
        };

        window.removeCartItem = function(index) {
            cart.splice(index, 1);
            saveCart();
        };

        // 3. Attach Add to Cart Events Globally
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(btn => {
            if (btn.textContent.replace(/\s+/g, ' ').trim().toLowerCase() === 'add to cart') {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const card = btn.closest('.product-card');
                    if (card) {
                        const img = card.querySelector('img.product-image');
                        const imgSrc = img ? img.src : 'https://placehold.co/400x500/eaeaea/a9a9a9?text=Image+Coming+Soon';
                        const titleEl = card.querySelector('h3');
                        
                        const priceContainer = card.querySelector('.text-right') || card;
                        const priceEls = Array.from(priceContainer.querySelectorAll('p')).filter(p => p.textContent.includes('Rs.'));
                        let actualPriceEl = priceEls.length > 0 ? priceEls[priceEls.length - 1] : card.querySelector('.font-extrabold[class*="text-"]');

                        if (titleEl && actualPriceEl) {
                            const product = {
                                name: titleEl.textContent.trim(),
                                image: imgSrc,
                                price: parsePrice(actualPriceEl.textContent),
                                quantity: 1
                            };

                            const existingIdx = cart.findIndex(item => item.name === product.name);
                            if (existingIdx > -1) {
                                cart[existingIdx].quantity += 1;
                            } else {
                                cart.push(product);
                            }

                            saveCart();
                            openCart();
                        }
                    }
                });
            }
        });

        // Initial renders
        updateCartCount();
        renderCartDrawer();
        if (window.location.pathname.includes('cart.html')) {
            renderCartPage();
        }
    }

    initCart();
});
