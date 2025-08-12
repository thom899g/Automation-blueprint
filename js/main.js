import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { initializeFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDfDmoUw7hi_3lY7ui_BwZPA8AKiukvSbk",
    authDomain: "automation-blueprint-9dd1c.firebaseapp.com",
    projectId: "automation-blueprint-9dd1c",
    storageBucket: "automation-blueprint-9dd1c.firebasestorage.app",
    messagingSenderId: "98738191485",
    appId: "1:98738191485:web:e59eaa031ef66319e64514",
    measurementId: "G-PFJ0L6M53G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserSessionPersistence)
  .then(() => console.log('Persistence set to session'))
  .catch(error => console.error('Persistence error:', error));

const db = initializeFirestore(app, { experimentalForceLongPolling: true });

let authResolve;
const authReady = new Promise((resolve) => { authResolve = resolve; });

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const mobileLogin = document.getElementById('mobile-login');
    const mobileLogout = document.getElementById('mobile-logout');
    const loginModal = document.getElementById('login-modal');
    const modalTitle = document.getElementById('modal-title');
    const authForm = document.getElementById('auth-form');
    const authSubmitButton = document.getElementById('auth-submit-button');
    const toggleAuthMode = document.getElementById('toggle-auth-mode');
    const closeModalButton = document.getElementById('close-modal-button');
    const messageModal = document.getElementById('message-modal');
    const messageText = document.getElementById('message-text');
    const closeMessageButton = document.getElementById('close-message-button');
    const siteHeader = document.querySelector('header');
    const siteFooter = document.querySelector('footer');

    let authInitialized = false;

    document.querySelectorAll('a[href="#deals"]').forEach(pricingLink => {
        pricingLink.remove();
    });

    if (loginButton) {
        loginButton.classList.add('bg-blue-600', 'px-6', 'py-2', 'rounded-full');
        loginButton.classList.remove('pb-2', 'border-b-2', 'border-transparent');
    }

    onAuthStateChanged(auth, (user) => {
        console.log('onAuthStateChanged triggered', user);
        if (user) {
            if (loginButton) loginButton.classList.add('hidden');
            if (logoutButton) logoutButton.classList.remove('hidden');
            if (mobileLogin) mobileLogin.classList.add('hidden');
            if (mobileLogout) mobileLogout.classList.remove('hidden');
        } else {
            localStorage.removeItem('purchasedCourses');
            if (loginButton) loginButton.classList.remove('hidden');
            if (logoutButton) logoutButton.classList.add('hidden');
            if (mobileLogin) mobileLogin.classList.remove('hidden');
            if (mobileLogout) mobileLogout.classList.add('hidden');
        }
        if (window.location.hash.substring(1).split('&')[0] === 'home') {
            setupCourseListings();
        }
        if (!authInitialized) {
            authInitialized = true;
            authResolve();
        }
        handleHashChange();
    });

    authReady.then(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success' && auth.currentUser) {
            const courseNames = {
                email: 'Email Automation',
                report: 'Report Automation + Data Transfer',
                expense: 'Invoice & Expense Automation',
                media: 'Media Automation'
            };
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists() && (doc.data().bundlePurchased || doc.data().purchasedCourses)) {
                    if (urlParams.has('bundle')) {
                        showMessage('Bundle purchase successful! You now have access to all courses.');
                    } else if (urlParams.has('courseId')) {
                        const courseId = urlParams.get('courseId');
                        showMessage(`Purchase successful! You now have access to the ${courseNames[courseId] || courseId} course.`);
                    }
                    localStorage.removeItem('purchasedCourses');
                    if (window.location.hash.substring(1).split('&')[0] === 'home') {
                        setupCourseListings();
                    }
                    unsubscribe();
                }
            });
            setTimeout(() => {
                unsubscribe();
                if (window.location.hash.substring(1).split('&')[0] === 'home') {
                    setupCourseListings();
                }
            }, 5000);
        }
        handleHashChange();
    });

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

    async function setupCourseListings() {
        const individualContainer = document.getElementById('individual-courses-list');
        const bundleContainer = document.getElementById('bundle-course-container');
        if (!individualContainer || !bundleContainer) return;
        const coursesData = [
            { id: "email", title: "Email Automation", teaser: "Automate emails with AI triggers – save hours weekly.", description: "Sends emails automatically based on user actions.", page: "../pages/email_1.html", image: "../img/email.png", stats: "Beginner • 24 lessons", price: "$9.99" },
            { id: "report", title: "Report Automation + Data Transfer", teaser: "Streamline reports and data flow across apps effortlessly.", description: "Automating the creation of regular reports and the transfer of data across applications.", page: "../pages/report_1.html", image: "../img/report.png", stats: "Beginner • 29 lessons", price: "$9.99" },
            { id: "expense", title: "Invoice & Expense Automation", teaser: "Effortless invoicing and expense tracking automation.", description: "Automating the creation of invoices and expenses.", page: "../pages/expense_1.html", image: "../img/expense.png", stats: "Beginner • 24 lessons", price: "$9.99" },
            { id: "media", title: "Media Automation", teaser: "Automate content creation and social distribution.", description: "Automating media creation and distribution.", page: "../pages/media_1.html", image: "../img/media.png", stats: "Beginner • 24 lessons", price: "$9.99" }
        ];
        const bundleData = {
            title: "The Complete Automation Bundle",
            description: "Get all four courses in one complete package and become an automation expert.",
            page: "../pages/bundle.html",
            price: "$24.99",
            savings: "37%"
        };
        const user = auth.currentUser;
        let purchases = null;
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    purchases = userDoc.data();
                }
            } catch (error) {
                console.error('Firestore getDoc error in setupCourseListings:', error);
                showMessage('Unable to fetch purchases due to network issue. Please check your connection.');
            }
        }
        const bundlePurchased = purchases?.bundlePurchased || false;
        individualContainer.innerHTML = '';
        bundleContainer.innerHTML = '';
        const bundleCard = document.createElement('div');
        bundleCard.className = 'bundle-card bg-gradient-to-br from-blue-600 to-indigo-600 p-8 md:p-12 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-2 relative overflow-hidden border border-gray-700/50';
        bundleCard.innerHTML = `
            <div class="absolute top-0 right-0 bg-green-400 text-white font-bold py-1 px-3 rounded-bl-lg">Save ${bundleData.savings}</div>
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
            </div>
            <div class="mt-6">
                ${bundlePurchased ?
                    '<span class="block text-green-400 font-bold text-xl">Unlocked – Access All Courses</span>' :
                    `<button class="get-bundle bg-white text-indigo-600 font-bold py-3 px-8 rounded-full transition-colors duration-300 hover:bg-gray-100">Get the Bundle for ${bundleData.price}</button>`
                }
            </div>
        `;
        bundleContainer.appendChild(bundleCard);
        const bundleBtn = bundleContainer.querySelector('.get-bundle');
        if (bundleBtn) {
            bundleBtn.addEventListener('click', () => createCheckoutSession('bundle'));
        } else {
            bundleCard.style.cursor = 'default';
        }
        coursesData.forEach((course, index) => {
            const gradientClasses = [
                'glass-card',
                'glass-card',
                'glass-card',
                'glass-card'
            ];
            const hasAccess = purchases?.bundlePurchased || purchases?.purchasedCourses?.includes(course.id) || false;
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
                        <p class="text-gray-300 text-base mb-3 line-clamp-1">${course.teaser}</p>
                    </div>
                    <div class="mt-4 flex space-x-2">
                        ${hasAccess ?
                            '<button class="access-course bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded flex-1">Access Now</button>' :
                            `<button class="buy-course bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded flex-1">Buy for ${course.price}</button>`
                        }
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
                if (hasAccess) {
                    const pageName = course.page.split('/').pop().split('.')[0];
                    window.location.hash = pageName;
                } else {
                    console.log(`Preview for ${course.title} coming soon`);
                }
            });
            const buyBtn = courseCard.querySelector('.buy-course');
            if (buyBtn) {
                buyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    createCheckoutSession(course.id);
                });
            }
            const accessBtn = courseCard.querySelector('.access-course');
            if (accessBtn) {
                accessBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const pageName = course.page.split('/').pop().split('.')[0];
                    window.location.hash = pageName;
                });
            }
            individualContainer.appendChild(courseCard);
        });
        individualContainer.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-6');
    }

    async function createCheckoutSession(id) {
        await authReady;
        const user = auth.currentUser;
        console.log('Current user:', user);
        if (!user) {
            showLoginModal();
            return;
        }
        try {
            // Map course IDs to Stripe payment links
            const paymentLinks = {
                email: 'https://buy.stripe.com/5kQdR9a25dtP3as7pM8IU04', // Replace with your actual Stripe payment link
                report: 'https://buy.stripe.com/5kQ5kD8Y14Xj6mEbG28IU05',
                expense: 'https://buy.stripe.com/5kQ6oHfmp89veTa11o8IU06',
                media: 'https://buy.stripe.com/9B67sLeil1L79yQ6lI8IU03',
                bundle: 'https://buy.stripe.com/3cI5kD6PT61n26oh0m8IU07'
            };
            const paymentLink = paymentLinks[id];
            if (!paymentLink) {
                throw new Error('Invalid course ID');
            }

            // Append user-specific query parameters to track the purchase
            const redirectUrl = new URL(paymentLink);
            redirectUrl.searchParams.append('client_reference_id', user.uid);
            redirectUrl.searchParams.append('prefilled_email', user.email);
            redirectUrl.searchParams.append('success_url', `${window.location.origin}/#home?payment=success${id === 'bundle' ? '&bundle=true' : `&courseId=${id}`}`);
            redirectUrl.searchParams.append('cancel_url', `${window.location.origin}/#home`);

            // Redirect to Stripe payment link
            window.location.href = redirectUrl.toString();
        } catch (error) {
            console.error('Checkout error:', error);
            showMessage('Error initiating checkout: ' + error.message + '. Please try again or contact support.');
        }
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
        setTimeout(() => {
            showSlide(0);
        }, 0);
    }

    function cleanupDynamicResources() {
        document.querySelectorAll('[data-dynamic-resource]').forEach(el => el.remove());
    }

    async function loadPage(page, anchor = null) {
        cleanupDynamicResources();
        await authReady;
        const user = auth.currentUser;
        const isCoursePage = page.startsWith('email_') || page.startsWith('report_') || page.startsWith('expense_') || page.startsWith('media_') || page === 'bundle';
        if (isCoursePage && !user) {
            showLoginModal();
            return;
        }
        if (isCoursePage) {
            const courseId = page.split('_')[0];
            const hasAccess = await checkCourseAccess(courseId);
            if (!hasAccess) {
                window.location.hash = 'home&anchor=deals';
                return;
            }
        }
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="text-center p-12 flex flex-col items-center justify-center min-h-[300px]">
                    <img src="../img/logo.gif" alt="Loading..." class="w-24 h-24 mb-4">
                    <p class="text-gray-400 text-lg">Loading content, please wait...</p>
                </div>
            `;
        }
        try {
            const fetchUrl = `../pages/${page}.html`;
            console.log('Fetching page:', fetchUrl);
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`Could not load page. Status: ${response.status}`);
            const text = await response.text();
            const parser = new DOMParser();
            const fetchedDoc = parser.parseFromString(text, 'text/html');
            mainContent.innerHTML = fetchedDoc.body.innerHTML;
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
                    document.body.style.setProperty('--overlay-opacity', '0.7');
                } else if (page === 'faq') {
                    document.body.style.backgroundColor = '#1a202c';
                    document.body.style.setProperty('--overlay-opacity', '0');
                    document.body.classList.add('no-overlay');
                    const questions = document.querySelectorAll('.question');
                    questions.forEach(question => {
                        question.addEventListener('click', function() {
                            console.log('Question clicked:', this.textContent);
                            const answer = this.nextElementSibling;
                            if (answer && answer.classList.contains('answer')) {
                                answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
                            }
                        });
                    });
                } else {
                    document.body.style.backgroundColor = '#1a202c';
                    document.body.style.setProperty('--overlay-opacity', '0');
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
                await setupCourseListings();
                setupScrollAnimation();
            } else if (page === 'about') {
                setupScrollAnimation();
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

    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash.replace(/&/g, "?"));
        const page = hash.split('&')[0] || 'home';
        const anchor = params.get('anchor');
        loadPage(page, anchor);
    }

    window.addEventListener('hashchange', handleHashChange);

    let isLoginMode = true;

    function showMessage(text) {
        if (messageText && messageModal) {
            messageText.innerHTML = text;
            messageModal.classList.remove('hidden');
        }
    }

    if (closeMessageButton) {
        closeMessageButton.addEventListener('click', () => {
            if (messageModal) {
                messageModal.classList.add('hidden');
            }
        });
    }

    function showLoginModal() {
        if (loginModal) loginModal.classList.remove('hidden');
    }

    if (closeModalButton) closeModalButton.addEventListener('click', () => { if (loginModal) loginModal.classList.add('hidden'); });

    if (toggleAuthMode) toggleAuthMode.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        if (modalTitle) modalTitle.textContent = isLoginMode ? 'Login' : 'Register';
        if (authSubmitButton) authSubmitButton.textContent = isLoginMode ? 'Login' : 'Register';
        if (toggleAuthMode) toggleAuthMode.textContent = isLoginMode ? "Don't have an account? Register" : 'Already have an account? Login';
    });

    if (authForm) authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        if (!emailInput || !passwordInput) return;
        const email = emailInput.value;
        const password = passwordInput.value;
        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            if (loginModal) loginModal.classList.add('hidden');
        } catch (error) {
            showMessage(error.message);
        }
    });

    if (logoutButton) logoutButton.addEventListener('click', async () => {
        await signOut(auth);
        window.location.hash = 'home';
    });

    if (mobileLogout) mobileLogout.addEventListener('click', async () => {
        await signOut(auth);
        window.location.hash = 'home';
    });

    if (loginButton) loginButton.addEventListener('click', showLoginModal);
    if (mobileLogin) mobileLogin.addEventListener('click', showLoginModal);

    async function checkCourseAccess(courseId) {
        const user = auth.currentUser;
        if (!user) return false;
        let purchases = JSON.parse(localStorage.getItem('purchasedCourses'));
        if (!purchases) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (!userDoc.exists()) return false;
                purchases = userDoc.data();
                localStorage.setItem('purchasedCourses', JSON.stringify(purchases));
            } catch (error) {
                console.error('Firestore getDoc error in checkCourseAccess:', error);
                showMessage('Unable to check course access due to network issue. Please check your connection.');
                return false;
            }
        }
        return purchases.bundlePurchased || purchases.purchasedCourses.includes(courseId);
    }
});