// Renderers
//==================================
let now, jQueryNodes, searchConditions;

function renderSearchResultGrid(domNode, searchResultList){
	domNode.removeClass('hidden');

	let html = '';
	for(let i = 0, l = searchResultList.length; i < l; i++){
		if(i % 2 === 0)
			html += `<div class="row">${renderSearchResultItem(searchResultList[i])}${renderSearchResultItem(searchResultList[i + 1])}</div>`
	}
	domNode.html(html)

	for(let searchResult of searchResultList){
		bindImageCarouselControls(searchResult)
	}

	domNode
	.addClass('animated fadeIn')
	.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
		domNode.removeClass('animated fadeIn')
	});
}

function renderSearchResultItem(searchResult){
	return searchResult? `<div class="col-xs-6" >
		<div class="ibox ibox-content product-box search-result" id="vehicle${searchResult.ID}">
			<div class="vehicle-img-container">
				<div>
					<a href="${VEHICLE_INFO_URL}/${searchResult.ID}" target="_blank">
						<div class="vehicle-img"
								${searchResult.ImageList
									&& searchResult.ImageList.length != 0
									&& `style="background-image:url('${searchResult.ImageList[0]}');"`} >
						</div>
					</a>
					<!-- Controls -->
					<a class="left carousel-control">
						<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
						<span class="sr-only">Previous</span>
					</a>
					<a class="right carousel-control">
						<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
						<span class="sr-only">Next</span>
					</a>
				</div>
				<div class="vehicle-price-tag" >
					${Math.ceil(Number.parseInt(searchResult.BestPossibleRentalPrice)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}<up>&#8363;</up>/<per>${searchResult.BestPossibleRentalPeriod < 24 ? `${searchResult.BestPossibleRentalPeriod} giờ` : 'ngày' }</per>
				</div>
			</div>
			<div class="vehicle-info row">
				<div class="col-xs-9">
				<div style="font-size:0.88em;">&nbsp;${searchResult.GarageName}${searchResult.GarageNumOfComment > 0
					? ` · ${renderStarRating(searchResult.GarageRating, '#4CAF50', false)}`
					: ''
				}</div>
					<a href="${VEHICLE_INFO_URL}/${searchResult.ID}" class="vehicle-name" target="_blank">${searchResult.Name} <b>(${searchResult.Year})</b></a>
					${searchResult.NumOfComment > 0
						? `<div class="center-flex">${renderStarRating(searchResult.Star, '#4CAF50')} · ${searchResult.NumOfComment} đánh giá</div>`
						: ''
					}
				</div>
				<div class="col-xs-3 text-right vehicle-seat center-flex">${searchResult.NumOfSeat}<img src="/Content/img/icons/person.png"/></div>	
				<div class="col-xs-12">
				<hr>
				</div>
				<div class="col-xs-offset-1 col-xs-6"><i class="fa fa-gears"></i> ${searchResult.TransmissionTypeName}</div>
				<div class="col-xs-5"><i class="fa fa-tint"></i> ${searchResult.FuelTypeName}</div>
			</div>
		</div>
	</div>` : '';
}

function bindImageCarouselControls(searchResult){
	let index = 0,
		last = searchResult.ImageList.length - 1,
		resultNode = $(`#vehicle${searchResult.ID}`),
		imageNode = resultNode.find('.vehicle-img');

	function changeImg(){
		imageNode.addClass('animated fadeOut')
		.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
			imageNode.removeClass('animated fadeOut')
			.css('background-image', `url('${searchResult.ImageList[index]}')`)
			.addClass('animated fadeIn')
			.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
				imageNode.removeClass('animated fadeIn')
			});
		});
	}

	resultNode.find('.left.carousel-control').click(() => {
		index = (index === 0) ? last : index - 1;
		changeImg();
	});

	resultNode.find('.right.carousel-control').click(() => {
		index = (index === last) ? 0 : index + 1;
		changeImg();
	});
}

function renderPaginator(domNode, data){
	domNode.data("twbs-pagination") && domNode.twbsPagination('destroy');
	domNode.removeClass('hidden');
	domNode.twbsPagination({
		startPage: data.CurrentPage,
		totalPages: data.TotalPage,
		visiblePages: 5,
		first: '<i class="fa fa-angle-double-left"></i>',
		prev: '<i class="fa fa-angle-left"></i>',
		next: '<i class="fa fa-angle-right"></i>',
		last: '<i class="fa fa-angle-double-right"></i>',
		onPageClick: function (event, page) {
			if(page != searchConditions.Page){
				searchConditions.Page = page;
				renderSearcher();
			}
		}
	});

	domNode
	.addClass('animated fadeIn')
	.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
		domNode.removeClass('animated fadeIn')
	});
}

function renderRecordInfo(domNode, data){
	let firstResultPosition = (searchConditions.Page - 1) * NUM_RECORD_PER_PAGE + 1
		, lastResultPosition = (searchConditions.Page * NUM_RECORD_PER_PAGE) < data.TotalResult
			? (searchConditions.Page * NUM_RECORD_PER_PAGE)
			: data.TotalResult
		, newHtml = `${firstResultPosition} - ${lastResultPosition} of ${data.TotalResult} vehicle(s)`;

	domNode.html(newHtml);

	domNode
	.addClass('animated fadeIn')
	.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
		domNode.removeClass('animated fadeIn')
	});
}

function renderPriceSlider(data){
	priceFilter.noUiSlider.destroy();
	let priceSlider = noUiSlider.create(priceFilter, {
		behaviour: 'drag-tap',
		connect: true,
		format: {
			to: value => `${Number.parseInt(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`,
			from: value => Number.parseInt(value.replace('₫/', '').replace(',', ''))
		},
		margin: 100000,
		pips: {
			mode: 'values',
			values: [ Number.parseInt(data.AveragePrice) ],
			density: Infinity,
			format: {
				to: value => `Trung&nbsp;bình:&nbsp;${Number.parseInt(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫/<small>${data.AveragePeriod < 24 ? `${data.AveragePeriod.toFixed(0)} giờ` : 'ngày'}</small>`
			}
		},
		start: [searchConditions.MinPrice || PRICE_SLIDER_MIN || 0, searchConditions.MaxPrice || PRICE_SLIDER_MAX || 100000],
		range: {
			'min': [PRICE_SLIDER_MIN || 0],
			'max': [PRICE_SLIDER_MAX || 100000]
		}
	});
	priceSlider.on('update', (values, handle, unencoded) => {
		$('#minPriceDisplay').html(values[0]);
		$('#maxPriceDisplay').html(values[1]);
	});
	priceSlider.on('set', (values, handle, unencoded) => {
		searchConditions.MinPrice = unencoded[0];
		searchConditions.MaxPrice = unencoded[1];

		delete searchConditions.Page;
		renderSearcher();
	});
}

function renderSearcher(){
	//console.log(searchConditions);
	jQueryNodes.searchResultGrid.addClass('hidden');
	jQueryNodes.paginator.addClass('hidden');
	jQueryNodes.recordInfo.html('<div class="text-center m-t">Loading...</div>');
	renderBlackLoadingScreen();
	$.ajax({
		url: QUERY_API_URL,
		type: 'GET',
		dataType: 'json',
		data: searchConditions
	})
	.done(function(data) {
		if(data.SearchResultList && data.SearchResultList.length > 0){
			searchConditions.Page = data.CurrentPage;

			renderSearchResultGrid(jQueryNodes.searchResultGrid, data.SearchResultList);
			renderPaginator(jQueryNodes.paginator, data);
			renderRecordInfo(jQueryNodes.recordInfo, data);
			renderPriceSlider(data);
		} else {
			jQueryNodes.recordInfo.html(`<div style="font-size:1.5em; text-align:center; padding: 3em 0">
				Không có xe nào đáp ứng với các điều kiện tìm kiếm của bạn. Xin vui lòng thử lại.
			</div>`);
		}
		removeBlackLoadingScreen();
	})
	.fail(function(err, textStatus, errorThrown) {
		console.log(err, textStatus, errorThrown);
		jQueryNodes.recordInfo.html(`<div style="font-size:1.5em; text-align:center; padding: 3em 0">
			Hệ thống đang gặp phải một số sự cố ngoài ý muốn. Chân thành xin lỗi quý khách. Xin quý khác vui lòng thử lại sau.
		</div>`);
		removeBlackLoadingScreen();
	})
}
//==================================

$(document).ready(() => {
	now = moment();

	jQueryNodes = {
		filters: $('#filters')
		, locationFilter : $('#locationFilter')
		, startTimeFilter: $('#startTimeFilter')
		, endTimeFilter: $('#endTimeFilter')
		, sorter: $('#sorter')
		, seatFilterCheckboxes: $('#seatFilter input[type=checkbox]')
		, modelFilter: $('#modelFilter')
		, fuelFilter: $('#fuelFilter')
		, categoryFilter: $('#categoryFilter')
		, colorFilterCheckboxes: $('#colorFilter input[type=checkbox]')
		, transmissionFilterCheckboxes: $('#transmissionFilter input[type=checkbox]')
		, vehicleRatingFilter: $('#vehicleRatingFilter')
		, garageRatingFilter: $('#garageRatingFilter')
		, searchResultGrid: $('#searchResultGrid')
		, resultContainer: $('#resultContainer')
		, paginator: $('#paginatior')
		, recordInfo: $('#recordInfo')
	}

	searchConditions = {
		BrandIDList: []
		, ColorIDList: []
		, ModelIDList: []
		, NumberOfSeatList: []
		, TransmissionTypeIDList: []
		, OrderBy: jQueryNodes.sorter.val()
		, IsDescendingOrder: jQueryNodes.sorter.find(":selected").data('is-descending')
	};

	let soonestPossibleBookingStartTimeFromNow = now.clone().add(SOONEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_HOUR, 'hours').subtract(1, 'minutes'),
		latestPossibleBookingStartTimeFromNow = now.clone().add(LATEST_POSSIBLE_BOOKING_START_TIME_FROM_NOW_IN_DAY, 'days').add(1, 'minutes'),
		soonestPossibleBookingEndTimeFromNow = now.clone().add(SOONEST_POSSIBLE_BOOKING_END_TIME_FROM_NOW_IN_HOUR, 'hours').subtract(1, 'minutes');

	let sessionStartTime = sessionStorage.getItem('startTime');
	sessionStartTime = sessionStartTime && moment(sessionStartTime);

	if(!sessionStartTime || (sessionStartTime.isBefore(soonestPossibleBookingStartTimeFromNow) && sessionStartTime.isAfter(latestPossibleBookingStartTimeFromNow)))
		sessionStartTime = now.clone().add(1, 'days');

	let sessionEndTime = sessionStorage.getItem('endTime');
	sessionEndTime = sessionEndTime && moment(sessionEndTime);

	if(!sessionEndTime || sessionEndTime.isBefore(soonestPossibleBookingEndTimeFromNow))
		sessionEndTime = now.clone().add(2, 'days');

	if(sessionEndTime.isBefore(sessionStartTime))
		sessionStartTime.clone().add(1, 'hours');

	searchConditions.StartTime = sessionStartTime.toJSON();
	searchConditions.EndTime = sessionEndTime.toJSON();

	sessionStorage.setItem('startTime', sessionStartTime.toJSON());
	sessionStorage.setItem('endTime', sessionEndTime.toJSON());

	let sessionLocationID = sessionStorage.getItem('locationID');
	if(sessionLocationID){
		jQueryNodes.locationFilter.val(JSON.parse(sessionLocationID));
		searchConditions.LocationID = jQueryNodes.locationFilter.val();
	}

	// ===========================================================
	// Filters

	// Transmission's checkboxes
	jQueryNodes.transmissionFilterCheckboxes.change(function(evt) {
		if(this.checked){
			searchConditions.TransmissionTypeIDList.push(this.value)
		} else {
			searchConditions.TransmissionTypeIDList = searchConditions.TransmissionTypeIDList.filter((el) => el != this.value)
		}

		delete searchConditions.Page;
		renderSearcher();
	});

	// Seat's checkboxes
	jQueryNodes.seatFilterCheckboxes.change(function(evt) {
		if(this.checked){
			searchConditions.NumberOfSeatList.push(this.value)
		} else {
			searchConditions.NumberOfSeatList = searchConditions.NumberOfSeatList.filter((el) => el != this.value)
		}
		delete searchConditions.Page;

		renderSearcher();
	});

	// Color's checkboxes
	jQueryNodes.colorFilterCheckboxes.change(function(evt) {
		if(this.checked){
			searchConditions.ColorIDList.push(this.value)
		} else {
			searchConditions.ColorIDList = searchConditions.ColorIDList.filter((el) => el != this.value)
		}
		delete searchConditions.Page;

		renderSearcher();
	});

	// Sort
	jQueryNodes.sorter.on('change', function() {
		searchConditions.OrderBy = $(this).val();
		searchConditions.IsDescendingOrder = $(this).find(":selected").data('is-descending');

		delete searchConditions.Page;
		renderSearcher();
	});

	// ============================================================
	// Time range filter
	// Start time
	jQueryNodes.startTimeFilter.datetimepicker({
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
	})
	.on('dp.hide', (data)=>{
		searchConditions.StartTime = data.date.toJSON();
		sessionStorage.setItem('startTime', searchConditions.StartTime);

		if(data.date.isAfter(jQueryNodes.endTimeFilter.data('DateTimePicker').date().clone().subtract(1, 'hours'))){
			let newEndTime = data.date.clone().add(1, 'hours')
			jQueryNodes.endTimeFilter.data('DateTimePicker').date(newEndTime);
			searchConditions.EndTime = newEndTime.toJSON();
			sessionStorage.setItem('endTime', searchConditions.EndTime);
		}

		delete searchConditions.Page;
		renderSearcher();
	})
	.on('dp.error', (data)=>{
		console.log(data);
	});

	// End time
	jQueryNodes.endTimeFilter.datetimepicker({
		useCurrent: false,
		defaultDate: sessionEndTime,
		minDate: soonestPossibleBookingEndTimeFromNow,
		format: 'YYYY/MM/DD HH:mm',
		ignoreReadonly: true,
		locale: 'vi',
		widgetParent: 'body',
	})
	// This on is for rendering the popup at the correct position
	.on('dp.show', function() {
		var datepicker = $('.bootstrap-datetimepicker-widget:last');
		datepicker.css({
			'top': `${$(this).offset().top + $(this).outerHeight()}px`,
			'bottom': 'auto',
			'left': `${$(this).offset().left}px`
		});
	})
	.on('dp.hide', (data)=>{
		searchConditions.EndTime = data.date.toJSON();
		sessionStorage.setItem('endTime', searchConditions.EndTime);

		if(data.date.isBefore(jQueryNodes.startTimeFilter.data('DateTimePicker').date().clone().add(1, 'hours'))){
			let newStartTime = data.date.clone().subtract(1, 'hours')
			jQueryNodes.startTimeFilter.data('DateTimePicker').date(newStartTime);
			searchConditions.StartTime = newStartTime.toJSON();
			sessionStorage.setItem('startTime', searchConditions.StartTime);
		}

		delete searchConditions.Page;
		renderSearcher();
	})
	.on('dp.error', (data)=>{
		console.log(data);
	});

	$(endTimeFilter).data('DateTimePicker').date();

	// ============================================================
	// Select2 selectors
	// Location
	
	jQueryNodes.locationFilter.select2({
		allowClear: true,
		placeholder: 'Bạn muốn thuê xe ở đâu?'
	})
	.on('change', function() {
		searchConditions.LocationID = $(this).val();
		sessionStorage.setItem('locationID', searchConditions.LocationID);

		delete searchConditions.Page;
		renderSearcher();
	});

	// Model
	function renderModelFilter(){
		jQueryNodes.modelFilter
		.select2({
			placeholder: 'Vui lòng chọn dòng xe...',
			templateSelection: (data) => {
				if(data.text.charAt(0) === 'b')
					return $(`<span><b>${data.text.substring(1)}</b></span>`)

				return $(`<span>${data.text.substring(1)}</span>`)
			},
			templateResult: (data) => {
				if(data.text.charAt(0) === 'b')
					return $(`<span class="brand-option">${data.text.substring(1)}</span>`)

				return $(`<span class="model-option">${data.text.substring(1)}</span>`)
			}
		})
		// Only allow to call once
		.one('change', function() {
			// Need to remove all models belonged to selected brands to keep the search simple

			// First, enable all model options
			$(this).find('option[data-lvl="1"]').each((i, el) => { el.disabled = false });

			// Get all the brand options
			searchConditions.BrandIDList = $(this).find('option:selected[data-lvl="0"]')
					.toArray().map(el => el.value);

			// Then disable all models belonged to the selected brands
			for(let brandID of searchConditions.BrandIDList){
				let opts = jQueryNodes.modelFilter.find(`option[data-brand="${brandID}"]`).each((i, el) => {
					// Disable only model options belonged to selected brands
					el.selected = false;
					el.disabled = true;
				});
			}

			// Then add the selected models into the searchConditions
			searchConditions.ModelIDList = $(this).find('option:selected[data-lvl="1"]')
					.toArray().map(el => el.value);

			delete searchConditions.Page;
			renderSearcher();

			// Regenerate modelFilter
			$(this).select2("destroy");
			$(this).off();
			renderModelFilter();
		});
	}
	renderModelFilter();

	// Category
	function renderCategoryFilter(){
		jQueryNodes.categoryFilter
		.select2({
			placeholder: 'Vui lòng chọn loại xe...'
		})
		.on('change', function() {
			searchConditions.CategoryIDList = $(this).val();
			delete searchConditions.Page;

			renderSearcher();
		});
	}
	renderCategoryFilter();

	// Fuel
	function renderFuelFilter(){
		jQueryNodes.fuelFilter
		.select2({
			placeholder: 'Vui lòng chọn loại nhiên liệu...'
		})
		.on('change', function() {
			searchConditions.FuelTypeIDList = $(this).val();
			delete searchConditions.Page;

			renderSearcher();
		});
	}
	renderFuelFilter();

	const starOptionFormat = (data) => {
		if(!data.id) return data.text;
		return $(`<span>${data.id}.0 ${renderStarRating(data.id, '#4CAF50', false)} trở lên</span>`);
	}

	// Vehicle rating filter slider
	function renderVehicleRatingFilter(){
		jQueryNodes.vehicleRatingFilter
		.select2({
			allowClear: true,
			placeholder: '--------',
			minimumResultsForSearch: Infinity,
			templateSelection: starOptionFormat,
			templateResult: starOptionFormat
		})
		.on('change', function() {
			searchConditions.MinVehicleRating = $(this).val();
			delete searchConditions.Page;

			renderSearcher();
		});
	}
	renderVehicleRatingFilter();

	// Garage rating filter slider
	function renderGarageRatingFilter(){
		jQueryNodes.garageRatingFilter.select2({
			allowClear: true,
			placeholder: '--------',
			minimumResultsForSearch: Infinity,
			templateSelection: starOptionFormat,
			templateResult: starOptionFormat
		})
		.on('change', function() {
			searchConditions.MinGarageRating = $(this).val();
			delete searchConditions.Page;

			renderSearcher();
		});
	}
	renderGarageRatingFilter();

	//=================================================
	// Sliders
	// Price filter slider
	let priceSlider = noUiSlider.create(priceFilter, {
		behaviour: 'drag-tap',
		connect: true,
		format: {
			to: value => `${Number.parseInt(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫`,
			from: value => Number.parseInt(value.replace('₫/', '').replace(',', ''))
		},
		margin: 100000,
		start: [PRICE_SLIDER_MIN || 0, PRICE_SLIDER_MAX || 100000],
		range: {
			'min': [0],
			'max': [PRICE_SLIDER_MAX || 100000]
		}
	});
	priceSlider.on('update', (values, handle, unencoded) => {
		$('#minPriceDisplay').html(values[0]);
		$('#maxPriceDisplay').html(values[1]);
	});
	priceSlider.on('set', (values, handle, unencoded) => {
		searchConditions.MinPrice = unencoded[0];
		searchConditions.MaxPrice = unencoded[1];

		delete searchConditions.Page;
		renderSearcher();
	});

	// Year filter slider
	let yearSlider = document.getElementById('yearFilter')
	function renderYearSlider(){
		noUiSlider.create(yearSlider, {
			connect: true,
			start: [YEAR_SLIDER_MIN || 1888, YEAR_SLIDER_MAX || now.year()],
			step: 1,
			range: {
				'min': [YEAR_SLIDER_MIN || 1888],
				'max': [YEAR_SLIDER_MAX || now.year()]
			}
		});
		yearSlider.noUiSlider.on('update', (values, handle, unencoded) => {
			$('#minYearDisplay').html(unencoded[0]);
			$('#maxYearDisplay').html(unencoded[1]);
		})
		yearSlider.noUiSlider.on('set', (values, handle, unencoded) => {
			searchConditions.MinProductionYear = unencoded[0];
			searchConditions.MaxProductionYear = unencoded[1];

			delete searchConditions.Page;
			renderSearcher();
		});
	}
	renderYearSlider();

	// Reset filter button
	$('#filterResetter').click(() => {
		// Reset seat
		jQueryNodes.seatFilterCheckboxes.each(function(){ this.checked=false; });
		searchConditions.NumberOfSeatList = [];

		// Reset transmission
		jQueryNodes.transmissionFilterCheckboxes.each(function(){ this.checked=false; });
		searchConditions.TransmissionTypeIDList = [];

		// Reset color
		jQueryNodes.colorFilterCheckboxes.each(function(){ this.checked=false; });
		searchConditions.ColorIDList = [];

		// Reset price range
		delete searchConditions.MaxPrice;
		delete searchConditions.MinPrice;

		// Reset year range
		delete searchConditions.MinProductionYear;
		delete searchConditions.MaxProductionYear;

		yearSlider.noUiSlider.destroy();
		renderYearSlider();

		// Reset fuel
		delete searchConditions.FuelTypeIDList;
		jQueryNodes.fuelFilter.val('');
		jQueryNodes.fuelFilter.select2("destroy");
		jQueryNodes.fuelFilter.off();
		renderFuelFilter();

		// Reset category
		delete searchConditions.CategoryIDList;
		jQueryNodes.categoryFilter.val('');
		jQueryNodes.categoryFilter.select2("destroy");
		jQueryNodes.categoryFilter.off();
		renderCategoryFilter();

		// Reset vehicle rating
		delete searchConditions.MinVehicleRating;
		jQueryNodes.vehicleRatingFilter.val('');
		jQueryNodes.vehicleRatingFilter.select2("destroy");
		jQueryNodes.vehicleRatingFilter.off();
		renderVehicleRatingFilter();

		// Reset garage rating
		delete searchConditions.MinGarageRating;
		jQueryNodes.garageRatingFilter.val('');
		jQueryNodes.garageRatingFilter.select2("destroy");
		jQueryNodes.garageRatingFilter.off();
		renderGarageRatingFilter();

		// Reset model
		searchConditions.ModelIDList = [];
		searchConditions.BrandIDList = [];
		jQueryNodes.modelFilter.find('option').each(function(){ this.disabled = false; this.selected=false; });
		jQueryNodes.modelFilter.select2("destroy");
		jQueryNodes.modelFilter.off();
		renderModelFilter();

		delete searchConditions.Page;
		renderSearcher();
	})

	// ========================================================
	// Render search result grid
	renderSearcher();
});