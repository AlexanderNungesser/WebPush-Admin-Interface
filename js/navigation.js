document.addEventListener("swac_components_complete", () => {
    const logo = document.getElementById("nav_logo");
    logo.src = "/WebPush-Admin-Interface/content/logo.png"

    const navLinks = document.querySelectorAll("#side_navigation .nav_link");
    let current = window.location.pathname.split("/").pop();
    if (!current) {
        current = "index.html";
    }
    navLinks.forEach(link => {
        const href = link.getAttribute("href");

        if (href.includes(current) || (current === "" && href.endsWith("index.html"))) {
            link.classList.add("active");
        }

        link.addEventListener("click", (event) => {
            navLinks.forEach(l => l.classList.remove("active"));
            event.currentTarget.classList.add("active");
        });
    });
});
