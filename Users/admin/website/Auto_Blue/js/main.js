document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');


    // --- All setup functions are now neatly inside the main listener ---

    function setupScrollAnimation() {
        const coursesHeading = document.getElementById('courses-heading');
        if (!coursesHeading) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chars = coursesHeading.querySelectorAll('.char');
                    chars.forEach((char, index) => {
                        setTimeout(() => {
                            char.style.opacity = '1';
                            char.style.transform = 'translateY(0)';
                        }, index * 50);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(coursesHeading);
    }

    function setupCourseListings() {
        const individualContainer = document.getElementById('individual-courses-list');
        const bundleContainer = document.getElementById('bundle-course-container');

        // Only run this code if we are on a page with these containers
        if (!individualContainer || !bundleContainer) return;

        const coursesData = [
            { title: "Email Automation", description: "Sends emails automatically based on user actions.", page: "../pages/email_1.html" },
            { title: "Report Automation + Data Transfer", description: "Automating the creation of regular reports and the transfer of data across applications.", page: "../pages/report_1.html" },
            { title: "Invoice & Expense Automation", description: "Automating the creation of invoices and expenses.", page: "../pages/expense_1.html" },
            { title: "Media Automation", description: "Automating media creation and distribution.", page: "../pages/media_1.html" }
        ];

        const bundleData = {
            title: "The Complete Automation Bundle",
            description: "Get all four courses in one complete package and become an automation expert.",
            page: "../pages/bundle.html"
        };

        // Render Individual Courses
        individualContainer.innerHTML = '';
        coursesData.forEach((course, index) => {
            const gradientClasses = [
                'bg-gradient-to-r from-blue-400 to-blue-600',
                'bg-gradient-to-r from-blue-400 to-blue-600',
                'bg-gradient-to-r from-blue-400 to-blue-600',
                'bg-gradient-to-r from-blue-400 to-blue-600'


            ];
            const courseCard = document.createElement('div');
            courseCard.className = `${gradientClasses[index % gradientClasses.length]} p-8 rounded-lg border border-transparent transition-colors duration-300 cursor-pointer group relative overflow-hidden`;
            courseCard.innerHTML = `
                <div class="transition-transform duration-300 ease-in-out group-hover:-translate-y-4">
                    <h3 class="text-xl font-bold text-dark mb-3">${course.title}</h3>
                </div>
                <p class="text-gray-300 text-base mt-4 absolute left-8 right-8 bottom-8 opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out">${course.description}</p>
                <div class="absolute top-6 right-6 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 group-hover:-rotate-45 transition-all duration-300 ease-in-out">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>`;
            courseCard.addEventListener('mouseenter', () => courseCard.classList.add('border-gray-700'));
            courseCard.addEventListener('mouseleave', () => courseCard.classList.remove('border-gray-700'));
            courseCard.addEventListener('click', () => {
                // Extract the page name from the full path
                const pageName = course.page.split('/').pop().split('.')[0];
                window.location.hash = pageName;
            });
            individualContainer.appendChild(courseCard);
        });

        // Render Bundle Course
        bundleContainer.innerHTML = '';
        const bundleCard = document.createElement('div');
        bundleCard.className = 'bundle-card bg-gradient-to-r from-blue-600 to-indingo-600 p-8 md:p-12 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-2';
        bundleCard.innerHTML = `
            <div class="md:flex md:items-center md:gap-12">
                <div class="md:w-1/2">
                    <h3 class="text-4xl font-bold text-white">${bundleData.title}</h3>
                    <p class="text-indigo-200 text-lg mt-4">${bundleData.description}</p>
                </div>
                <div class="md:w-1/2 mt-8 md:mt-0">
                    <h4 class="font-semibold text-white text-lg mb-3">What's Included:</h4>
                    <ul class="space-y-2">${coursesData.map(course => `
                        <li class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span class="text-indigo-100">${course.title}</span>
                        </li>`).join('')}
                    </ul>
                </div>
            </div>`;
        bundleCard.addEventListener('click', () => window.location.href = bundleData.page);
        bundleContainer.appendChild(bundleCard);
    }

    function setupSlideNavigation() {
        const slidesContainer = document.getElementById('slides-container');
        if (!slidesContainer) return;

        let currentSlide = 0;
        const slides = slidesContainer.querySelectorAll('.slide');
        const totalSlides = slides.length;
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const slideCounter = document.getElementById('slide-counter');

        function showSlide(slideIndex) {
            if (slideIndex < 0 || slideIndex >= totalSlides) return;
            currentSlide = slideIndex;
            slides.forEach(s => s.classList.remove('active'));
            slides[currentSlide].classList.add('active');
            if (slideCounter) slideCounter.textContent = `Slide ${currentSlide + 1} / ${totalSlides}`;
            updateNavButtons();
        }

        function updateNavButtons() {
            if (prevBtn) prevBtn.disabled = currentSlide === 0;
            if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
        }

        const nextSlide = () => { if (currentSlide < totalSlides - 1) showSlide(currentSlide + 1); };
        const prevSlide = () => { if (currentSlide > 0) showSlide(currentSlide - 1); };
        const handleKeyPress = (event) => {
            if (event.key === 'ArrowRight') nextSlide();
            if (event.key === 'ArrowLeft') prevSlide();
        };

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        document.removeEventListener('keydown', handleKeyPress); // Prevent duplicate listeners
        document.addEventListener('keydown', handleKeyPress);
        showSlide(0);
    }

    // --- Core Navigation Logic ---

    async function loadPage(page, anchor = null) {
        const isPaid = localStorage.getItem('payment_successful') === 'true';
        const isCoursePage = page.startsWith('email_') || page.startsWith('report_') || page.startsWith('expense_') || page.startsWith('media_');

        if (isCoursePage && !isPaid) {
            alert('You must purchase a course to view this content.');
            window.location.hash = 'home&anchor=deals'; // Redirect to pricing section
            return;
        }

        mainContent.innerHTML = `<div class="text-center p-12"><i class="fas fa-spinner fa-spin text-4xl text-blue-400"></i></div>`;
        try {
            const response = await fetch(page === 'home' ? `pages/${page}.html` : `../pages/${page}.html`);
            if (!response.ok) throw new Error(`Could not load page. Status: ${response.status}`);
            
            mainContent.innerHTML = await response.text();
            updateActiveLink(page);
            if (mobileMenu) mobileMenu.classList.add('hidden');

            // --- UPDATED: Conditionally run setup functions ---
            if (page === 'home') {
                setupCourseListings(); // Correct function name
                setupScrollAnimation();
            } else {
                setupSlideNavigation();
            }

            if (anchor) {
                const elementToScrollTo = document.getElementById(anchor);
                if (elementToScrollTo) elementToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Error loading page:', error);
            mainContent.innerHTML = `<div class="text-center p-12 glass-card rounded-lg"><h2 class="text-2xl font-bold text-red-400">Error Loading Content</h2><p class="text-red-300 mt-2">The requested page could not be found or loaded.</p></div>`;
        }
    }

    function updateActiveLink(activePage) {
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.classList.toggle('text-white', link.dataset.page === activePage);
            link.classList.toggle('border-blue-400', link.dataset.page === activePage);
            link.classList.toggle('text-gray-300', link.dataset.page !== activePage);
            link.classList.toggle('border-transparent', link.dataset.page !== activePage);
        });
    }

    // --- Event Listeners ---

    document.addEventListener('click', function(e) {
        const link = e.target.closest('.nav-link');
        if (link) {
            e.preventDefault();
            const page = link.dataset.page;
            const anchor = link.dataset.anchor;
            if (page) {
                const currentPage = window.location.hash.substring(1).split('&')[0] || 'home';
                if (page === currentPage && anchor) {
                    const elementToScrollTo = document.getElementById(anchor);
                    if (elementToScrollTo) elementToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.location.hash = anchor ? `${page}&anchor=${anchor}` : page;
                }
            }
        }
    });
    
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }

    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash.replace(/&/g, "?"));
        const page = hash.split('&')[0] || 'home';
        const anchor = params.get('anchor');
        loadPage(page, anchor);
    }
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial page load
});