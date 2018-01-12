$(document).ready(function(){
	// Render star ratings
	$('.rating').each(function(){ $(this).html(renderStarRating($(this).data('rating'), '#388E3C')); })
	$('.rating-no-badge').each(function(){ $(this).html(renderStarRating($(this).data('rating'), '#388E3C', false)); })

	// Stick the bookingSection upon scrolling past it.
	new Waypoint.Sticky({
		element: $('#bookingSection'),
		offset: 50
	})

	// Display scrollspy upon scrolling past 1st infoSection
	new Waypoint({
		element: $('.info-section')[0],
		handler: function(direction) {
			$('#infoNavBar').toggleClass('hidden-info-nav');
		},
		offset: 75
	})

	// Scrolling handlers for scrollspy, scroll to 70px above a section
	$('#infoNavBar a').click(function (event) {
		var scrollPos = $('body > #wrapper').find($(this).attr('href')).offset().top - 70;
		$('body,html').animate({
			scrollTop: scrollPos
		}, 500);
		return false;
	});

	$('#infoModal').on('show.bs.modal', function (e) {
		let modalBodyContent = 
			`<div class="row" style="font-size:1.2em;">
				<label class="col-xs-12">Email</label>
				<div class="col-xs-12"><a class="btn btn-primary btn-block btn-outline" href="mailto:${EMAIL}">${EMAIL}</a></div>
				<label class="col-xs-12">Số điện thoại chính</label>
				<div class="col-xs-12"><a class="btn btn-primary btn-block btn-outline" href="callto:${PHONE1}">+${PHONE1}</a></div>
				${PHONE2
					? `<label class="col-xs-12">Số điện thoại thay thế</label>
						<div class="col-xs-12"><a class="btn btn-primary btn-block btn-outline" href="callto:${PHONE2}">+${PHONE2}</a></div>`
					: ''}
			</div>`

		$(this).find('.modal-body').html(modalBodyContent);
	})

	let now = moment();
	// StartTimePicker
	let soonestPossibleBookingStartTimeFromNow = now.clone().add(SOONEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_HOUR, 'hours').subtract(1, 'minutes'),
		latestPossibleBookingStartTimeFromNow = now.clone().add(LATEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_DAY, 'days').add(1, 'minutes');

	// Get the startTime from the search page to populate the booking section
	let sessionStartTime = sessionStorage.getItem('startTime');
	sessionStartTime = sessionStartTime && moment(sessionStartTime);

	if(!sessionStartTime || (sessionStartTime.isBefore(soonestPossibleBookingStartTimeFromNow) && sessionStartTime.isAfter(latestPossibleBookingStartTimeFromNow)))
		sessionStartTime = now.clone().add(1, 'days');

	let $startTimePicker = $('#startTimePicker').datetimepicker({
		useCurrent: false,
		defaultDate: sessionStartTime,
		minDate: soonestPossibleBookingStartTimeFromNow,
		maxDate: latestPossibleBookingStartTimeFromNow,
		format: 'YYYY/MM/DD HH:mm',
		ignoreReadonly: true,
		locale: 'vi',
		widgetParent: 'body',
	})
	// This on is for rendering the popup at the correct position
	.on('dp.show', function() {
		let datepicker = $('.bootstrap-datetimepicker-widget:last');
		datepicker.css({
			'top': `${$(this).offset().top + $(this).outerHeight()}px`,
			'bottom': 'auto',
			'left': `${$(this).offset().left}px`
		});
	});

	// In case the section is scrolled, reupdate datetimepicker's position
	$(window).scroll(function(event) {
		var datepicker = $('.bootstrap-datetimepicker-widget:last');
		datepicker.css({
			'top': `${$('#startTimePicker').offset().top + $('#startTimePicker').outerHeight()}px`,
		});
	});

	// ============================================
	// Image carousel rendering
	let imageIndex = 0,
		lastImageIndex = IMAGE_LIST.length - 1,
		$vehicleCarousel = $('#vehicleCarousel'),
		$carouselDisplay = $('#carouselDisplay');

	const changeImg = () => {
		$carouselDisplay.addClass('animated fadeOut')
		.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
			$carouselDisplay.removeClass('animated fadeOut')
			.css('background-image', `url('${IMAGE_LIST[imageIndex]}')`)
			.addClass('animated fadeIn')
			.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
				$carouselDisplay.removeClass('animated fadeIn')
			});
		});
	}
	changeImg();

	$('#vehiclePrimaryImage').click(() => {
		$vehicleCarousel.addClass('active');
		$('body').addClass('modal-open');
	})

	// bind the carousel's controllers
	$vehicleCarousel.find('.fa-times').click(()=>{
		$vehicleCarousel.removeClass('active');
		$('body').removeClass('modal-open');
	});
	$vehicleCarousel.find('.left.carousel-control').click(() => {
		imageIndex = (imageIndex === 0) ? lastImageIndex : imageIndex - 1;
		changeImg();
	});

	$vehicleCarousel.find('.right.carousel-control').click(() => {
		imageIndex = (imageIndex === lastImageIndex) ? 0 : imageIndex + 1;
		changeImg();
	});

	// bind esc button
	$(document).keyup(function(e){
		if(e.keyCode === 27){
			$vehicleCarousel.removeClass('active');
			$('body').removeClass('modal-open');
		}
	});


	// ============================================
	// Tooltip for booking section
	$("[data-toggle='tooltip']").tooltip();


	// =============================================
	// Comments
	if(NUM_OF_COMMENT > 0){
		let $commentContainer = $('#commentContainer');

		function renderComment(data){
			return `<div class="comment-item">
				<div class="comment-user">
					${data.avatarURL
						? `<img src="${data.avatarURL}" alt="avatar" class="img-circle" />`
						: '<i class="fa fa-user-circle"></i>'
					}
					<p>${data.customer}</p>
				</div>
				<div class="comment-content">
					<p>${renderStarRating(data.star, '#388E3C', false)}</p>
					<p style="white-space: pre-line;">${data.comment}</p>
				</div>
			</div>`;
		}

		function renderCommentContainer(page = 1){
			$.ajax({
				url: COMMENT_FETCHING_URL,
				dataType: 'json',
				data: {page: page},
			})
			.done(function(data) {
				$commentContainer.html(data.reduce((html, record) => {
					return html + renderComment(record);
				}, ''))
			})
			.fail(function(err, textStatus, errorThrown) {
				toastr.error("Có lỗi xảy ra. Phiền bạn reload trang web.")
			})
		}
		
		renderCommentContainer();

		$('#commentPaginator').twbsPagination({
			startPage: 1,
			totalPages: Math.ceil(NUM_OF_COMMENT / NUM_OF_COMMENT_PER_PAGE),
			visiblePages: 5,
			first: '<i class="fa fa-angle-double-left"></i>',
			prev: '<i class="fa fa-angle-left"></i>',
			next: '<i class="fa fa-angle-right"></i>',
			last: '<i class="fa fa-angle-double-right"></i>',
			onPageClick: (event, page) => {
				renderCommentContainer(page)
			}
		});
	}


	// =============================================
	// Calendar

	function loadCalendar(){
		// events for soonestPossibleBookingStartTimeFromNow and latestPossibleBookingStartTimeFromNow
		let allowedPeriod = {
			events: [
				{
					id: 3
					, title: 'Giờ có thể đặt'
					, start: soonestPossibleBookingStartTimeFromNow.clone()
					, end: latestPossibleBookingStartTimeFromNow.clone()
				},
				{
					id: 4
					, allDay: true
					, title: 'Giờ có thể đặt'
					, start: soonestPossibleBookingStartTimeFromNow.clone().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
					, end: latestPossibleBookingStartTimeFromNow.clone().set({ hour: 24, minute: 0, second: 0, millisecond: 0 })
				}
			]
			, backgroundColor: '#FE4C4C'
			, overlap: true
			, rendering: "inverse-background"
		};

		// events generated using garage's open/close time
		let workingEvents = {
			events: []
			, backgroundColor: '#CCCCCC'
			, overlap: true
			, rendering: "inverse-background"
		};

		for (time of WORK_TIMES) {
			let weekDay = moment().day(time.DayOfWeek).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
				openTime = weekDay.clone().add(time.OpenTimeInMinute, 'minutes'),
				closeTime = weekDay.clone().add(time.CloseTimeInMinute, 'minutes');

			do {
				if (closeTime.isAfter(soonestPossibleBookingStartTimeFromNow)) {
					workingEvents.events.push({
						id: 1
						, title: 'Giờ làm việc'
						, start: openTime.isAfter(soonestPossibleBookingStartTimeFromNow)
								? openTime.clone()
								: soonestPossibleBookingStartTimeFromNow.clone()
						, end: closeTime.isBefore(latestPossibleBookingStartTimeFromNow)
								? closeTime.clone()
								: latestPossibleBookingStartTimeFromNow.clone()
					});
					workingEvents.events.push({
						id: 2
						, title: 'Giờ làm việc'
						, allDay: true
						, start: openTime.isAfter(soonestPossibleBookingStartTimeFromNow)
								? openTime.clone()
								: soonestPossibleBookingStartTimeFromNow.clone()
						, end: closeTime.isBefore(latestPossibleBookingStartTimeFromNow)
								? closeTime.clone()
								: latestPossibleBookingStartTimeFromNow.clone()
					});
				}

				openTime.add(1, 'weeks');
				closeTime.add(1, 'weeks');
			} while(openTime.isBefore(latestPossibleBookingStartTimeFromNow))
		}

		// Events from other bookings
		let bookingEvents = {
			backgroundColor: '#4CAF50'
			, overlap: true
			, rendering: "background"
		};

		$.ajax({
			url: CALENDAR_FETCHING_URL,
			dataType: 'json'
		})
		.done((data) => {
			// Trim the events' start/end time to be between soonestPossibleBookingStartTimeFromNow and latestPossibleBookingStartTimeFromNow
			bookingEvents.events = data.reduce((eventList, val) => {
				if(moment(val.start).isBefore(soonestPossibleBookingStartTimeFromNow))
					val.start = soonestPossibleBookingStartTimeFromNow.clone();

				if(moment(val.end).isAfter(latestPossibleBookingStartTimeFromNow))
					val.end = latestPossibleBookingStartTimeFromNow.clone();

				eventList.push({ id: 7, title: "Đặt trước", start: val.start, end: val.end });
				eventList.push({ id: 8, title: "Đặt trước", start: val.start, end: val.end, allDay: true });

				return eventList;
			}, []);

			$('#calendar').fullCalendar({
				eventSources: [ bookingEvents, workingEvents, allowedPeriod ]
				, allDaySlot: false
				, defaultView: 'month'
				, header: { center: 'month,agendaWeek' }
				, slotLabelFormat: 'HH:mm'
				, timezone: 'local'
				, views: {
					agendaWeek: {}
					, month: {}
				}
			})
		})
		.fail(() => {
			toastr.error("Có lỗi xảy ra. Phiền bạn reload trang web.")
		})
	}
	loadCalendar();

	// ==============================================
	// Render the booking section info
	let $rentalType = $('#rentalType'),
		$rentalTypePrice = $('#rentalTypePrice')
		$rentalPrice = $('#rentalPrice'),
		$servicePrice = $('#servicePrice'),
		$totalFee = $('#totalFee'),
		$depositPrice = $('#depositPrice'),
		$numOfDay = $('#numOfDay'),
		$distance = $('#distance');

	let rentalTypeValue
		, rentalUnitPrice
		, rentalUnitDistance
		, distanceValue
		, rentalPriceValue
		, servicePriceValue
		, numOfDayValue = Number.parseInt($numOfDay.val());

	renderBookingInfo = () =>{
		// Enable numOfDay input if it is perDay rental
		rentalTypeValue = Number.parseInt($rentalType.val());
		if(rentalTypeValue == 0)
			$numOfDay.prop('disabled', false);
		else
			$numOfDay.prop('disabled', true);

		// Render the price per unit display
		rentalUnitPrice = $rentalType.find('option:selected').data('price');
		$rentalTypePrice.html(`${rentalUnitPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫/${rentalTypeValue == 0 ? 'ngày' : `${rentalTypeValue} giờ`}`);

		// Rental Price
		rentalPriceValue = rentalTypeValue == 0 ? rentalUnitPrice * numOfDayValue : rentalUnitPrice
		$rentalPrice.html(`${rentalPriceValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`);

		// Deposit
		depositValue = Number.parseInt(rentalPriceValue * DEPOSIT_PERCENTAGE);
		$depositPrice.html(`${depositValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`);

		// Service Price
		servicePriceValue = Number.parseInt(rentalPriceValue * BOOKING_FEE_PERCENTAGE);
		$servicePrice.html(`${servicePriceValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`);

		// Total fee
		$totalFee.html(`${(depositValue + servicePriceValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`);

		// Distance
		rentalUnitDistance = $rentalType.find('option:selected').data('distance') || NaN;
		distanceValue = rentalTypeValue == 0 ? rentalUnitDistance * numOfDayValue : rentalUnitDistance
		$distance.html(Number.isNaN(distanceValue) ? 'Không giới hạn' : `${distanceValue} km`)
	}
	renderBookingInfo();

	// Also rerender on changes
	$rentalType.change(renderBookingInfo);

	$numOfDay.change(() => {
		if(Number.parseInt($numOfDay.val()) > Number.parseInt($numOfDay.prop('max'))) {
			$numOfDay.val($numOfDay.prop('max'));
		} else if (Number.parseInt($numOfDay.val()) < Number.parseInt($numOfDay.prop('min'))) {
			$numOfDay.val($numOfDay.prop('min'));
		}

		numOfDayValue = Number.parseInt($numOfDay.val());

		// Rental Price
		rentalPriceValue = rentalTypeValue == '0' ? rentalUnitPrice * numOfDayValue : rentalUnitPrice
		$rentalPrice.html(`${rentalPriceValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`);

		// Deposit
		depositValue = Number.parseInt(rentalPriceValue * DEPOSIT_PERCENTAGE);
		$depositPrice.html(`${depositValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`);

		// Service Price
		servicePriceValue = Number.parseInt(rentalPriceValue * BOOKING_FEE_PERCENTAGE);
		$servicePrice.html(`${servicePriceValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`);

		// Total Fee
		$totalFee.html(`${(depositValue + servicePriceValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`);

		// Distance
		distanceValue = rentalTypeValue == 0 ? rentalUnitDistance * numOfDayValue : rentalUnitDistance
		$distance.html(Number.isNaN(distanceValue) ? 'Không giới hạn' : `${distanceValue} km`)
	})

	// Booking button
	$('#bookingBtn').click(() => {
		renderBlackLoadingScreen();

		let bookingData = {
			VehicleID: VEHICLE_ID
			, StartTime: $startTimePicker.data("DateTimePicker").date().toJSON()
			, RentalType: rentalTypeValue
		};

		if(rentalTypeValue == 0)
			bookingData.NumOfDay = numOfDayValue;

		$.ajax({
			url: BOOKING_HANDLER_URL,
			type: 'POST',
			data: bookingData
		})
		.done(function(data) {
			if (data.errorCode){
				toastr.error(data.message);
				loadCalendar();
			}
			removeBlackLoadingScreen();
		})
		.fail(function(err, textStatus, errorThrown) {
			toastr.error("Đã có lỗi xảy ra. Phiền bạn thử lại sau");
			removeBlackLoadingScreen();
			console.log(err);
		})
		
	});
});