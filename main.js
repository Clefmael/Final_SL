document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Function to close the mobile menu
    function closeMenu() {
        mobileMenu.classList.add('hidden');
    }

    // Handle mobile menu toggle
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
        });
    }
    
    if (closeBtn && mobileMenu) {
        closeBtn.addEventListener('click', closeMenu);
    }
    
    // Attach closeMenu to mobile nav links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // --- Page-Specific Logic ---

    // Animated counters for Home page
    const counters = document.querySelectorAll('[data-target]');
    if (counters.length > 0) {
        const speed = 200; // The lower the number, the faster the count

        const animateCounters = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText.replace(/,/g, ''); // Remove commas for parsing

                    const inc = Math.ceil(target / speed);

                    if (count < target) {
                        counter.innerText = (count + inc).toLocaleString();
                        setTimeout(updateCount, 10);
                    } else {
                        counter.innerText = target.toLocaleString(); // Final set with commas
                    }
                };
                updateCount();
            });
        };

        // Use Intersection Observer to trigger animation when section is visible
        const impactSection = document.querySelector('.grid-cols-1.md\\:grid-cols-3');
        if (impactSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounters();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(impactSection);
        }
    }

    // Volunteer Form submission handler
    const volunteerForm = document.getElementById('volunteer-form');
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const successDiv = document.getElementById('volunteer-success');
            if (successDiv) {
                successDiv.classList.remove('hidden');
            }
            this.reset();
        });
    }

    // Contact Form submission handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const successDiv = document.getElementById('contact-success');
            if (successDiv) {
                successDiv.classList.remove('hidden');
            }
            this.reset();
        });
    }

    // Donation amount selection for Donate page
    const donationButtons = document.querySelectorAll('.donation-amount');
    const customAmountInput = document.getElementById('custom-amount');
    if (donationButtons.length > 0) {
        donationButtons.forEach(button => {
            button.addEventListener('click', () => {
                donationButtons.forEach(btn => {
                    btn.classList.remove('bg-blue-100', 'border-blue-500');
                });
                button.classList.add('bg-blue-100', 'border-blue-500');
                if (button.innerText.toLowerCase() !== 'other') {
                    customAmountInput.value = '';
                } else {
                    customAmountInput.focus();
                }
            });
        });
    }

    // Set the active navigation link based on the current page's file name
    const path = window.location.pathname.split('/').pop();
    let linkId = 'home';
    if (path) {
        linkId = path.replace('.html', '');
    }

    const desktopLink = document.querySelector(`.nav-link[href="${linkId}.html"]`);
    if (desktopLink) {
        desktopLink.classList.add('nav-link-active');
    }
});