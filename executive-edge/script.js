// Executive Validation Page Scripts

// Countdown Timer
function updateCountdown() {
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 2);
    endTime.setHours(endTime.getHours() + 14);
    
    const now = new Date();
    const timeRemaining = endTime - now;
    
    if (timeRemaining > 0) {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        let countdownText = '';
        if (days > 0) countdownText += `${days} day${days > 1 ? 's' : ''}, `;
        countdownText += `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
        
        document.getElementById('countdown').textContent = countdownText;
    }
}

// Update countdown every minute
updateCountdown();
setInterval(updateCountdown, 60000);

// Live visitor counter (simulated)
function updateVisitorCount() {
    const baseCount = 487;
    const variation = Math.floor(Math.random() * 40) - 20; // +/- 20
    const count = baseCount + variation;
    const element = document.querySelector('.live-counter p');
    if (element) {
        element.textContent = `${count} executives viewing this page now`;
    }
}

// Update visitor count every 5-10 seconds
setInterval(updateVisitorCount, 5000 + Math.random() * 5000);

// Form submission
document.getElementById('executiveForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    // Show success message
    const button = this.querySelector('button');
    const originalText = button.textContent;
    button.textContent = '✓ Success! Check your email';
    button.style.background = '#28a745';
    button.disabled = true;
    
    // Here you would normally send the email to your backend
    console.log('Email submitted:', email);
    
    // Reset after 3 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        button.disabled = false;
        this.reset();
    }, 3000);
});

// Smooth scroll for CTA button
document.querySelectorAll('a[href^="#"], button[onclick*="scrollIntoView"]').forEach(element => {
    element.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href') || '#executiveForm');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all major sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});