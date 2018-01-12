$(document).ready(function(){
	let now = moment();

	// Location filter
	$(locationFilter).select2({
		allowClear: true,
		placeholder: "Vui lòng chọn địa điểm thuê xe...",
	})

	// Time range filter
	// Start time
	$(startTimeFilter).datetimepicker({
		useCurrent: false,
		defaultDate: now.clone().add(1, 'days'),
		minDate: now.clone().add(SOONEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_HOUR, 'hours').subtract(1, 'minutes'),
		maxDate: now.clone().add(LATEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_DAY, 'days').add(1, 'minutes'),
		format: 'YYYY/MM/DD HH:mm',
		locale: 'vi',
		ignoreReadonly: true,
	})
	.on('dp.hide', (data)=>{
		if(data.date.isAfter($(endTimeFilter).data('DateTimePicker').date().clone().subtract(1, 'hours'))){
			let newEndTime = data.date.clone().add(1, 'hours')
			$(endTimeFilter).data('DateTimePicker').date(newEndTime);
		}
	})
	// End time
	$(endTimeFilter).datetimepicker({
		useCurrent: false,
		defaultDate: now.clone().add(2, 'days'),
		minDate: now.clone().add(SOONEST_POSSIBLE_BOOKING_END_TIME_FROM_NOW_IN_HOUR, 'hours').subtract(1, 'minutes'),
		format: 'YYYY/MM/DD HH:mm',
		locale: 'vi',
		ignoreReadonly: true,
	})
	.on('dp.hide', (data)=>{
		if(data.date.isBefore($(startTimeFilter).data('DateTimePicker').date().clone().add(1, 'hours'))){
			let newStartTime = data.date.clone().subtract(1, 'hours')
			$(startTimeFilter).data('DateTimePicker').date(newStartTime);
		}
	})

	$(searchBtn).click(()=>{
		let startTime = $(startTimeFilter).data("DateTimePicker").date(),
			endTime = $(endTimeFilter).data("DateTimePicker").date(),
			locationID = $(locationFilter).val();

		startTime && sessionStorage.setItem('startTime', startTime.toJSON());
		endTime && sessionStorage.setItem('endTime', endTime.toJSON());
		locationID && sessionStorage.setItem('locationID', JSON.stringify(locationID));

		location = searchPageUrl;
	})
});