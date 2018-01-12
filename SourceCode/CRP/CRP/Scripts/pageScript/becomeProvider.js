$(document).ready(() => {
	let paymentForm = $('#paymentForm');

	// payment plan selecting buttons
	$('#1MonthPlanBtn').click(function(evt){
		evt.preventDefault();
		evt.stopPropagation();

		$('.subcription-plan').removeClass('active');
		$(this).parents('.subcription-plan').addClass('active');
		$('.payment').addClass('active animated fadeInDown');
		paymentForm.find('#OrderCode').val(1);
	});
	$('#3MonthPlanBtn').click(function(evt){
		evt.preventDefault();
		evt.stopPropagation();

		$('.subcription-plan').removeClass('active');
		$(this).parents('.subcription-plan').addClass('active');
		$('.payment').addClass('active animated fadeInDown');
		paymentForm.find('#OrderCode').val(3)
	});
	$('#6MonthPlanBtn').click(function(evt){
		evt.preventDefault();
		evt.stopPropagation();

		$('.subcription-plan').removeClass('active');
		$(this).parents('.subcription-plan').addClass('active');
		$('.payment').addClass('active animated fadeInDown');
		paymentForm.find('#OrderCode').val(6)
	});

	// payment method radio group
	$('input[name="PaymentMethod"]').change(function(evt){
		$('.payment-type-detail').removeClass('active');
		if(this.value == "ATM_ONLINE")
			$('#ATM_ONLINE_Detail').addClass('active');
		else if(this.value == "VISA")
			$('#VISA_Detail').addClass('active');
		else if(this.value == "NL")
			$('#NL_Detail').addClass('active');
	})

	// Submit buttons
	$('#payBtn').click((evt) => {
		evt.preventDefault();
		evt.stopPropagation();

		paymentForm.submit();
	})
	$('#deleteBtn').click((evt) => {
		evt.preventDefault();
		evt.stopPropagation();

		location = "/";
	})
});