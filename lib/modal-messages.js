showError = function (message) {
    $(".error-text").text(message);
    $("#errorModal").modal("show");
};

showSuccess = function (message) {
    $(".success-text").text(message);
    $("#successModal").modal("show");
};