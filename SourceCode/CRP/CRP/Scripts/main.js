$(document).ready(() => {
	// Always set this to true to use traditional param serialization
	// http://api.jquery.com/jquery.ajax/
	jQuery.ajaxSettings.traditional = true;

	moment.locale('vi');

	toastr.options = {
		closeButton: false
		, debug: false
		, newestOnTop: true
		, progressBar: true
		, positionClass: 'toast-top-right'
		, preventDuplicates: false
		, showDuration: 300
		, hideDuration: 1000
		, timeOut: 5000
		, extendedTimeOut: 1000
		, showEasing: 'swing'
		, hideEasing: 'linear'
		, showMethod: 'fadeIn'
		, hideMethod: 'fadeOut'
	}
})