(function() {
    'use strict';

    const productGrid = document.getElementById('productGrid');
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const sortSelect = document.getElementById('sortSelect');
    const countDisplay = document.getElementById('countDisplay');

    let products = [];
    let filters = { search: '', genre: 'all', sort: 'default' };
    let lastRendered = '';

    function getGenres() {
        const genres = products.map(p => p.genre);
        return ['all', ...new Set(genres)];
    }

    function filterProducts() {
        const search = filters.search.toLowerCase().trim();
        let filtered = products;

        if (search) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
        }

        if (filters.genre !== 'all') {
            filtered = filtered.filter(p => p.genre === filters.genre);
        }

        return filtered;
    }

    function sortProducts(filtered) {
        if (filters.sort === 'low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'high') {
            filtered.sort((a, b) => b.price - a.price);
        }
        return filtered;
    }

    function render(productsToRender) {
        productGrid.innerHTML = '';

        if (productsToRender.length === 0) {
            productGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-book-open"></i>
                    <p>No novels match your filters.</p>
                </div>
            `;
            countDisplay.textContent = '0';
            return;
        }

        const fragment = document.createDocumentFragment();

        for (const product of productsToRender) {
            const card = document.createElement('div');
            card.className = 'product-card';

            const imageDiv = document.createElement('div');
            imageDiv.className = 'product-image';
            if (product.image) {
                const img = document.createElement('img');
                img.src = product.image;
                img.alt = product.name;
                img.loading = 'lazy';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '1rem';
                img.onerror = function() {
                    this.style.display = 'none';
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-book';
                    this.parentElement.appendChild(icon);
                };
                imageDiv.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fas fa-book';
                imageDiv.appendChild(icon);
            }

            const nameEl = document.createElement('div');
            nameEl.className = 'product-name';
            nameEl.textContent = product.name;

            const genreEl = document.createElement('div');
            genreEl.className = 'product-genre';
            genreEl.textContent = product.genre;

            const priceEl = document.createElement('div');
            priceEl.className = 'product-price';
            priceEl.innerHTML = `$${product.price.toFixed(2)} <small>USD</small>`;

            card.appendChild(imageDiv);
            card.appendChild(nameEl);
            card.appendChild(genreEl);
            card.appendChild(priceEl);

            fragment.appendChild(card);
        }

        productGrid.appendChild(fragment);
        countDisplay.textContent = productsToRender.length;
    }

    function updateCatalog() {
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading novels...</p>
                </div>
            `;
            countDisplay.textContent = '0';
            return;
        }

        const filtered = filterProducts();
        const sorted = sortProducts(filtered);

        const ids = sorted.map(p => p.id).join('|');
        if (ids === lastRendered) return;
        lastRendered = ids;

        render(sorted);
    }

    function populateGenres() {
        const genres = getGenres();
        const currentVal = categorySelect.value;

        categorySelect.innerHTML = '';
        for (const genre of genres) {
            const opt = document.createElement('option');
            opt.value = genre;
            opt.textContent = genre === 'all' ? 'All Genres' : genre;
            categorySelect.appendChild(opt);
        }

        categorySelect.value = genres.includes(currentVal) ? currentVal : 'all';
    }

    function handleFilterChange() {
        filters.search = searchInput.value;
        filters.genre = categorySelect.value;
        filters.sort = sortSelect.value;
        updateCatalog();
    }

    searchInput.addEventListener('input', handleFilterChange);
    categorySelect.addEventListener('change', handleFilterChange);
    sortSelect.addEventListener('change', handleFilterChange);

    async function loadProducts() {
        try {
            const response = await fetch('products.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or empty product data');
            }
            
            products = data;
            populateGenres();
            filters.search = searchInput.value;
            filters.genre = categorySelect.value;
            filters.sort = sortSelect.value;
            lastRendered = '';
            updateCatalog();
        } catch (error) {
            console.error('Error loading products:', error);
            productGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load novels: ${error.message}</p>
                    <p style="font-size:0.85rem;margin-top:0.5rem;color:rgba(255,255,255,0.4);">
                        Make sure products.json is in the same folder
                    </p>
                </div>
            `;
            countDisplay.textContent = '0';
        }
    }

    productGrid.innerHTML = `
        <div class="no-products">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading novels...</p>
        </div>
    `;
    loadProducts();

})();