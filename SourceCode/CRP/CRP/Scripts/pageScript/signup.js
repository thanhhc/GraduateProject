$(document).ready(function () {
    function validateSpace(str) {
        var regex = /^\S*$/;
        return regex.test(str);
    }

    $('#saveChange').on('click', function () {
        let model = {};
        model.username = null;
        if (!validateSpace($('#username').val())) {
            toastr.error("Tên đăng nhập không được chứa khoảng trống!");
            return false;
        } else {
            model.username = $('#username').val();
        }
    });
});