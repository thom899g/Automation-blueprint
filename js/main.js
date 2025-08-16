document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const siteHeader = document.querySelector('header');
    const siteFooter = document.querySelector('footer');

    // Course data for display and linking
    const coursesData = [
        { title: 'Email Automation', page: 'email_1', image: 'img/email.png', stats: '10 Lessons' },
        { title: 'Report Automation', page: 'report_1', image: 'img/report.png', stats: '15 Lessons' },
        { title: 'Expense Management', page: 'expense_1', image: 'img/expense.png', stats: '20 Lessons' },
        { title: 'Social Media', page: 'media_1', image: 'img/media.png', stats: '20 Lessons' },
    ];

    // Bundle data is commented out as it is not used in the free course model
    // const bundleData = {
    //     title: 'Complete Course Bundle',
    //     price: 'free',
    //     description: 'Get access to all courses!',
    //     savings: '100%',
    // };

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
        const individualContainer = document.getElementById('individual-courses-container');
        const bundleContainer = document.getElementById('bundle-container');
    
        if (!individualContainer) {
            console.error("Course container 'individual-courses-container' not found. Check your HTML.");
            return;
        }

        if (bundleContainer) {
            bundleContainer.innerHTML = '';
        }
    
        individualContainer.innerHTML = '';
    
        coursesData.forEach((course, index) => {
            const gradientClasses = ['glass-card', 'glass-card', 'glass-card', 'glass-card'];
            const courseCard = document.createElement('div');
            courseCard.className = `${gradientClasses[index % gradientClasses.length]} rounded-lg border border-gray-700/50 transition-all duration-300 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:-translate-y-2 hover:scale-105`;
            courseCard.innerHTML = `
                <div class="relative">
                    <img src="${course.image}" alt="${course.title}" class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110 origin-top">
                    <div class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 transition-all duration-300">
                        <h3 class="text-xl font-bold text-white">${course.title}</h3>
                    </div>
                </div>
                <div class="p-6">
                    <div>
                        <span class="bg-gray-800 text-gray-300 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded mb-2">${course.stats}</span>
                        <p class="text-gray-300 text-base mb-3 line-clamp-1">Explore the course content here.</p>
                    </div>
                    <div class="mt-4 flex space-x-2">
                        <button class="access-course bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded flex-1">Access Now</button>
                    </div>
                </div>
                <div class="absolute top-6 right-6 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 group-hover:-rotate-45 transition-all duration-300 ease-in-out">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            `;
            courseCard.addEventListener('mouseenter', () => courseCard.classList.add('border-blue-500/50'));
            courseCard.addEventListener('mouseleave', () => courseCard.classList.remove('border-blue-500/50'));
            courseCard.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                window.location.hash = `${course.page}`;
            });
            individualContainer.appendChild(courseCard);
        });
        individualContainer.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
    }

    function setupSlideNavigation() {
        const slidesContainer = document.getElementById('slides-container');
        if (!slidesContainer) return;
        let currentSlide = 0;
        const slides = slidesContainer.querySelectorAll('.slide');
        const totalSlides = slides.length;
        const nextBtn = document.getElementById('next');
        const prevBtn = document.getElementById('prev');
        const slideCounter = document.getElementById('progress-text');

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

        const handleKeyPress = (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        };

        if (nextBtn) {
            nextBtn.removeEventListener('click', nextSlide);
            nextBtn.addEventListener('click', nextSlide);
        }
        if (prevBtn) {
            prevBtn.removeEventListener('click', prevSlide);
            prevBtn.addEventListener('click', prevSlide);
        }
        document.removeEventListener('keydown', handleKeyPress);
        document.addEventListener('keydown', handleKeyPress);
        
        setTimeout(() => { showSlide(0); }, 0);
    }

    function cleanupDynamicResources() {
        document.querySelectorAll('[data-dynamic-resource]').forEach(el => el.remove());
    }

    async function loadPage(page, anchor = null) {
        cleanupDynamicResources();
        
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="text-center p-12 flex flex-col items-center justify-center min-h-[300px]">
                    <img src="img/logo.gif" alt="Loading..." class="w-24 h-24 mb-4">
                    <p class="text-gray-400 text-lg">Loading content, please wait...</p>
                </div>
            `;
        }
        try {
            const fetchUrl = `pages/${page}.html`;
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`Could not load page. Status: ${response.status}`);
            const text = await response.text();
            const parser = new DOMParser();
            const fetchedDoc = parser.parseFromString(text, 'text/html');
            mainContent.innerHTML = fetchedDoc.body.innerHTML;
            
            const isCoursePage = coursesData.some(course => course.page === page);

            if (isCoursePage) {
                if (siteHeader) siteHeader.style.display = 'none';
                if (siteFooter) siteFooter.style.display = 'none';
                document.body.style.backgroundColor = '#ffffff';
                document.body.style.setProperty('--overlay-opacity', '0');
                mainContent.style.width = '100%';
                mainContent.style.maxWidth = 'none';
                mainContent.style.padding = '0';
                mainContent.style.margin = '0';
            } else {
                if (siteHeader) siteHeader.style.display = '';
                if (siteFooter) siteFooter.style.display = '';
                mainContent.style.width = '';
                mainContent.style.maxWidth = '';
                mainContent.style.padding = '';
                mainContent.style.margin = '';
                if (page !== 'home') {
                    document.body.style.backgroundImage = '';
                }
                if (page === 'home') {
                    document.body.style.backgroundColor = '#1a202c';
                } else if (page === 'faq') {
                    document.body.style.backgroundColor = '#1a202c';
                    document.body.classList.add('no-overlay');
                    const questions = document.querySelectorAll('.question');
                    questions.forEach(question => {
                        question.addEventListener('click', function() {
                            const answer = this.nextElementSibling;
                            if (answer && answer.classList.contains('answer')) {
                                answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
                            }
                        });
                    });
                } else {
                    document.body.style.backgroundColor = '#1a202c';
                    document.body.classList.add('no-overlay');
                }
            }
            fetchedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
                const newEl = el.cloneNode(true);
                newEl.dataset.dynamicResource = 'true';
                document.head.appendChild(newEl);
            });
            fetchedDoc.querySelectorAll('script').forEach(el => {
                const script = document.createElement('script');
                script.dataset.dynamicResource = 'true';
                if (el.src) {
                    script.src = el.src;
                    document.body.appendChild(script);
                } else {
                    try {
                        const scriptFn = new Function(el.textContent);
                        scriptFn();
                    } catch (error) {
                        console.error('Error executing inline script:', error);
                    }
                }
            });
            if (isCoursePage) {
                const homeLink = document.getElementById('home-link');
                if (homeLink) {
                    homeLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.hash = 'home';
                    });
                }
            }
            updateActiveLink(page);
            if (mobileMenu) mobileMenu.classList.add('hidden');
            if (page === 'home') {
                setupCourseListings();
                setupScrollAnimation();
            } else if (page === 'about') {
                setupScrollAnimation();
            } else if (page === 'services') {
                // Add any specific setup for the services page here
            } else if (page === 'contact') {
                // Add any specific setup for the contact page here
            } else if (page === 'faq') {
                const questions = document.querySelectorAll('.question');
                questions.forEach(question => {
                    question.addEventListener('click', function() {
                        const answer = this.nextElementSibling;
                        if (answer && answer.classList.contains('answer')) {
                            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
                        }
                    });
                });
            }
            
            if (anchor) {
                const elementToScrollTo = document.getElementById(anchor);
                if (elementToScrollTo) elementToScrollTo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (error) {
            console.error('Load page error:', error);
            if (mainContent) mainContent.innerHTML = `<div class="text-center p-12 glass-card rounded-lg"><h2 class="text-2xl font-bold text-red-400">Error Loading Content</h2><p class="text-red-300 mt-2">The requested page could not be found or loaded: ${error.message}</p></div>`;
        }
    }

    function updateActiveLink(activePage) {
        document.querySelectorAll('#main-nav .nav-link[data-page], #mobile-menu .nav-link[data-page]').forEach(link => {
            if (link.id === 'brand-link') {
                link.classList.add('text-white');
                link.classList.remove('border-b-2', 'border-blue-400', 'border-transparent', 'text-gray-300', 'bg-blue-600', 'px-6', 'py-2', 'rounded-full');
            } else if (link.dataset.page === activePage) {
                link.classList.add('text-white', 'border-b-2', 'border-blue-400');
                link.classList.remove('text-gray-300', 'border-transparent');
            } else {
                link.classList.remove('bg-blue-600', 'px-6', 'py-2', 'rounded-full', 'text-white', 'border-blue-400');
                link.classList.add('text-gray-300', 'border-transparent');
            }
        });
    }

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
    
    // Core SPA routing logic
    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash.replace(/&/g, "?"));
        const page = hash.split('&')[0] || 'home';
        const anchor = params.get('anchor');
        loadPage(page, anchor);
    }
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Initial page load
    handleHashChange();
});