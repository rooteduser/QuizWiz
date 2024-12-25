document.addEventListener("DOMContentLoaded", () => {
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    profileButton.addEventListener("click", () => {
        profileDropdown.classList.toggle("active");
        profileDropdown.classList.toggle("hidden");
    });

    // Close the dropdown if clicked outside
    document.addEventListener("click", (event) => {
        if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
            profileDropdown.classList.add("hidden");
            profileDropdown.classList.remove("active");
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    // Select all quiz elements
    const quizzes = document.querySelectorAll('.quiz');

    // Function to add the 'breathe-in' class when an element is in view
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add 'breathe-in' class to trigger animation
                entry.target.classList.add('breathe-in');

                // Stop observing the element once the animation has been applied
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.5 // Trigger the animation when 50% of the element is in view
    });

    // Observe each quiz element
    quizzes.forEach(quiz => {
        observer.observe(quiz);
    });
});


// Code for Slide Up Animation
document.addEventListener("DOMContentLoaded", () => {
    const features = document.querySelectorAll(".feature");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate"); // Add the animation class
            }
        });
    });

    features.forEach((feature) => observer.observe(feature));
});