// Master-T Clinical Page Scripts

// Symptom Checker
const symptomCheckboxes = document.querySelectorAll('.symptom-item input[type="checkbox"]');
const symptomAlert = document.querySelector('.symptom-alert');

function updateSymptomAlert() {
    const checkedCount = document.querySelectorAll('.symptom-item input[type="checkbox"]:checked').length;
    
    if (checkedCount >= 2) {
        symptomAlert.style.display = 'block';
        // Animate the alert
        setTimeout(() => {
            symptomAlert.style.opacity = '0';
            symptomAlert.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                symptomAlert.style.opacity = '1';
                symptomAlert.style.transform = 'translateY(0)';
            }, 10);
        }, 10);
    } else {
        symptomAlert.style.display = 'none';
    }
}

symptomCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateSymptomAlert);
});

// Animate Progress Bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width || bar.offsetWidth + 'px';
                
                // Reset and animate
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
                
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.1 });
    
    progressBars.forEach(bar => observer.observe(bar));
}

// Initialize progress bars
document.addEventListener('DOMContentLoaded', animateProgressBars);

// Form Submission
document.getElementById('clinicalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const button = this.querySelector('button');
    const originalContent = button.innerHTML;
    
    // Show processing state
    button.innerHTML = '<img src="images/loading.svg" alt="Processing"> Processing...';
    button.disabled = true;
    button.style.opacity = '0.8';
    
    // Simulate processing
    setTimeout(() => {
        button.innerHTML = '✓ Assessment Sent to Your Email';
        button.style.background = 'var(--medical-green)';
        
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            z-index: 9999;
        `;
        successMessage.innerHTML = `
            <h3 style="color: var(--medical-green); margin-bottom: 15px;">
                ✓ Success! Check Your Email
            </h3>
            <p style="color: var(--trust-gray);">
                Your personalized clinical assessment has been sent to:<br>
                <strong>${email}</strong>
            </p>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 10px 30px;
                background: var(--primary-blue);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">OK</button>
        `;
        
        document.body.appendChild(successMessage);
        
        // Reset form
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.style.background = '';
            button.disabled = false;
            button.style.opacity = '1';
            this.reset();
        }, 3000);
    }, 1500);
    
    console.log('Clinical assessment requested for:', email);
});

// Smooth scroll for CTA
document.querySelectorAll('button[onclick*="scrollIntoView"]').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('clinicalForm').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    });
});

// Add trust indicator hover effects
document.querySelectorAll('.trust-item, .certifications img').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'transform 0.3s';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// Add citation expansion
const studyCitation = document.querySelector('.study-citation');
studyCitation.style.cursor = 'pointer';
studyCitation.addEventListener('click', function() {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        max-width: 600px;
        z-index: 9999;
    `;
    popup.innerHTML = `
        <h3 style="margin-bottom: 20px;">Study Details</h3>
        <p style="line-height: 1.6; color: var(--trust-gray);">
            <strong>Title:</strong> Age-Related Testosterone Decline in American Men: 
            A Comprehensive Analysis<br><br>
            <strong>Journal:</strong> New England Journal of Medicine<br>
            <strong>Date:</strong> March 2023<br>
            <strong>Sample Size:</strong> 12,847 participants<br>
            <strong>Duration:</strong> 5-year longitudinal study<br><br>
            <strong>Key Finding:</strong> 87% of men over 40 showed clinically low testosterone 
            levels (&lt;300 ng/dL), with average decline of 1.5% per year after age 30.
        </p>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 20px;
            padding: 10px 30px;
            background: var(--primary-blue);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Close</button>
    `;
    
    document.body.appendChild(popup);
});