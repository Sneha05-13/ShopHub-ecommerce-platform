// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile menu script loaded');
    
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    const navLinks = document.querySelector('.nav-links');
    
    console.log('Mobile menu icon:', mobileMenuIcon);
    console.log('Nav links:', navLinks);
    
    if (mobileMenuIcon && navLinks) {
        console.log('Both elements found, adding event listeners');
        
        mobileMenuIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu clicked');
            
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            console.log('Menu icon classes:', this.className);
            console.log('Nav links classes:', navLinks.className);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileMenuIcon.classList.contains('active') && 
                !mobileMenuIcon.contains(e.target) && 
                !navLinks.contains(e.target)) {
                console.log('Clicking outside, closing menu');
                mobileMenuIcon.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                console.log('Link clicked, closing menu');
                mobileMenuIcon.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenuIcon.classList.contains('active')) {
                console.log('Escape key pressed, closing menu');
                mobileMenuIcon.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    } else {
        console.error('Mobile menu elements not found');
        console.error('Mobile menu icon element:', mobileMenuIcon);
        console.error('Nav links element:', navLinks);
    }
    
    // Add test function for debugging
    window.testMobileMenu = function() {
        const icon = document.getElementById('mobile-menu-icon');
        const nav = document.querySelector('.nav-links');
        
        console.log('=== Mobile Menu Test ===');
        console.log('Icon exists:', !!icon);
        console.log('Nav exists:', !!nav);
        console.log('Icon display:', window.getComputedStyle(icon).display);
        console.log('Nav display:', window.getComputedStyle(nav).display);
        console.log('Window width:', window.innerWidth);
        console.log('Media query matches:', window.matchMedia('(max-width: 768px)').matches);
        
        if (icon) {
            console.log('Icon classes:', icon.className);
            icon.click();
            setTimeout(() => {
                console.log('After click - Icon classes:', icon.className);
                console.log('After click - Nav classes:', nav.className);
            }, 100);
        }
    };
});
