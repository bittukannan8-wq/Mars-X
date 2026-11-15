// MARS-X FRONTEND JAVASCRIPT


// Smooth scrolling function

function scrollToSection(sectionId) {

    const section = document.getElementById(sectionId);

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// Highlight active navigation link

const sections = document.querySelectorAll(
    "section[id]"
);

const navigationLinks = document.querySelectorAll(
    ".navbar nav a"
);

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        if (window.scrollY >= sectionTop) {

            currentSection = section.getAttribute("id");

        }

    });

    navigationLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + currentSection
        ) {

            link.classList.add("active");

        }

    });

});


// Log application initialization

document.addEventListener("DOMContentLoaded", () => {

    console.log("MARS-X Frontend Loaded Successfully");

});