login_info_element = document.querySelector("#login-btn");

if (getAuthToken()){
    login_info_element.innerHTML = `
    <a href="./dashboard.html">
        <i class="fa fa-user-circle-o fa-lg" aria-hidden="true"></i>
        Shreyas A
    </a>
    `
} else {
    if(window.location.href.includes("booking") || window.location.href.includes("dashboard")){
        window.location.href = "./login.html";
    }
}