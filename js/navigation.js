document.addEventListener("swac_components_complete", () => {
    console.log("HIER")
    const navLinks = document.querySelectorAll("#side_navigation .nav_link");
    const current = window.location.pathname.split("/").pop();
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
