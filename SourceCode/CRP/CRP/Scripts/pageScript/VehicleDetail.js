Dropzone.autoDiscover = false;

const bookingTableColumns = [
	{ name: 'ID', data: 'ID', visible: false, orderable: false, searchable: false }
	, { name: 'CustomerName', title: 'Tên khách hàng', data: 'CustomerName' }
	, { name: 'CustomertEmail', data: 'CustomertEmail', visible: false, orderable: false, searchable: false }
	, { name: 'CustomerPhone', data: 'CustomerPhone', visible: false, orderable: false, searchable: false }
	, { name: 'VehicleID', data: 'VehicleID', visible: false, orderable: false, searchable: false }
	, { name: 'VehicleName', data: 'VehicleName', visible: false, orderable: false, searchable: false }
	, { name: 'LicenseNumber', data: 'LicenseNumber', visible: false, orderable: false, searchable: false }
	, { name: 'RentalPrice', title: 'Giá thuê', data: 'RentalPrice' }
	, { name: 'Deposit', title: 'Đặt cọc', data: 'Deposit' }
	, { name: 'StartTime', title: 'Thuê từ', data: 'StartTime' }
	, { name: 'EndTime', title: 'Thuê đến', data: 'EndTime' }
	, { name: 'Star', title: "Đánh giá", data: 'Star', width: '6.5em' }
	, { name: 'Comment', data: 'Comment', visible: false, orderable: false, searchable: false }
	, { name: 'IsInThePast', data: 'IsInThePast', visible: false, orderable: false, searchable: false }
	, { name: 'IsCanceled', data: 'IsCanceled', visible: false, orderable: false, searchable: false }
	, { name: 'IsSelfBooking', data: 'IsSelfBooking', visible: false, orderable: false, searchable: false }
	, { name: 'Type', title: "Tình trạng", width: '5em', orderable: false, searchable: false }
	, { name: 'Action', title: "Thao tác", width: '5em', orderable: false, searchable: false }
]

const viDatatables = {
	lengthMenu: "Hiển thị _MENU_ dòng",
	search: "Tìm kiếm",
	paginate: {
		first: "Trang đầu",
		previous: "Trang trước",
		next: "Trang sau",
		last: "Trang cuối",
	},
	zeroRecords: "Không tìm thấy dữ liệu",
	info: "Đang hiển thị _START_ đến _END_ trên tổng cộng _TOTAL_ dòng",
	infoEmpty: "không có dữ liệu",
	infoFiltered: "(được lọc ra từ _MAX_ dòng)"
}

$(document).ready(function () {
	// ==============================================================================================================
	// Booking receipt section
	let isCanceled = true;
	let isSelfBooking = true;
	let isInThePast = null;

	let table = $('#bookingTable').DataTable({
		dom: "lftipr"
		, serverSide: true
		, ajax: {
			url: BOOKING_FETCHING_URL
			, data: (rawData) => {
				return {
					Draw: rawData.draw,
					Search: rawData.search.value,
					vehicleID: VEHICLE_ID,
					IsCanceled: isCanceled,
					IsSelfBooking: isSelfBooking,
					IsInThePast: isInThePast,
					RecordPerPage: rawData.length,
					Page: rawData.start / rawData.length + 1,
					OrderBy: bookingTableColumns[rawData.order[0].column].data,
					IsDescendingOrder: rawData.order[0].dir == 'desc'
				};
			}
		},
		language: viDatatables,
		retrieve: true,
		scrollCollapse: true,
		processing: true,
		columns: bookingTableColumns,
		columnDefs: [
            {
                targets: -9
				, render: function (data, type, row) {
				    if (type === 'display') {
				        return moment(data).local().format('ddd, DD/MM/YYYY, HH:mm');
				    }
				    return data;
				}
            },
            {
                targets: -8
				, render: function (data, type, row) {
				    if (type === 'display') {
				        return moment(data).local().format('ddd, DD/MM/YYYY, HH:mm');
				    }
				    return data;
				}
            },
			{
				targets: -7
				, render: function (data, type, row) {
					if (data !== null) {
						return renderStarRating(data, '#4CAF50', false);
					}
					return '-';
				}
			},
			{
				targets: -2
				, render: function (data, type, row) {
					var timeReceipt = "";
					var canceled = "";
					var status = "";
					if (row.IsInThePast) {
						timeReceipt = `<div class="status-label" >
							<p class ="label label-lg label-success">Đã qua</p>
						</div>`;
					} else {
						timeReceipt = `<div class="status-label" >
							<p class ="label label-lg label-warning">Sắp đến</p>
						</div>`;
					}
					if (row.IsCanceled) {
						canceled = `<div class="status-label" >
							<p class ="label label-lg label-danger">Đã hủy</p>
						</div>`;
					}

					if (row.IsSelfBooking) {
						status = `<div class="status-label" >
						<p class ="label label-lg label-info">Tự đặt</p>
					</div>`;
					}
					if(!row.IsCanceled && !row.IsSelfBooking && row.IsInThePast)
					{
						status = `<div class="status-label" >
						<p class ="label label-lg label-primary">Thành công</p>
					</div>`;
					}
					
					return timeReceipt + " " + status + " " + canceled;
				}
			},
			{
				targets: -1
				, render: function (data, type, row) {
					var info = `<a class="btn btn-success btn-sm" data-toggle="modal" data-target="#detailBooking"
						data-customer-name="${row.CustomerName}" data-customer-email="${row.CustomertEmail}" data-customer-phone="${row.CustomerPhone}"
						data-vehicle-name="${row.VehicleName}" data-license-number="${row.LicenseNumber}"
						data-rental-price="${row.RentalPrice}" data-deposit="${row.Deposit}" data-start-time="${row.StartTime}" data-end-time="${row.EndTime}"
						data-star="${row.Star}" data-comment="${row.Comment}" ><i class ="fa fa-info-circle"></i><span> Chi tiết</span></a>`;
					var del = '';
					if (row.IsSelfBooking && !row.IsInThePast && !row.IsCanceled) {
						del = `<a class="btn btn-danger btn-sm" data-toggle="modal" data-target="#cancelBooking" data-id="${row.ID}"
							data-vehicle-name="${row.VehicleName}" data-start-time="${row.StartTime}" data-end-time="${row.EndTime}" ><i class="fa fa-trash"></i><span> Hủy</span></a>`;
					}
					if (row.IsSelfBooking) {
					    return del;
					}
					return info +" "+ del;
				}
			}
		]
	});

	$('#isCanceled, #isSelfBooking, input[name="bookingTime"]').on('change', function () {
		if ($('#isCanceled').is(':checked')) {
			isCanceled = true;
		} else {
			isCanceled = false;
		}
		if ($('#isSelfBooking').is(':checked')) {
			isSelfBooking = true;
		} else {
			isSelfBooking = false;
		}

		if ($('input[name="bookingTime"]:checked').val() === "past") {
			isInThePast = true;
		} else if ($('input[name="bookingTime"]:checked').val() === "future") {
			isInThePast = false;
		} else {
			isInThePast = null;
		}
		table.ajax.reload();
	});

	$('#detailBooking').on('show.bs.modal', function (event) {
		let button = $(event.relatedTarget),
			customerName = button.data('customer-name'),
			customerEmail = button.data('customer-email'),
			customerPhone = button.data('customer-phone'),
			vehicleName = button.data('vehicle-name'),
			licenseNumber = button.data('license-number'),
			rentalPrice = button.data('rental-price'),
			deposit = button.data('deposit'),
			startTime = moment(button.data('start-time')).local().format('ddd, DD/MM/YYYY, HH:mm'),
			endTime = moment(button.data('end-time')).local().format('ddd, DD/MM/YYYY, HH:mm'),
			star = button.data('star'),
			comment = button.data('comment');

		$('#customerName').text(customerName);
		$('#customerEmail').text(customerEmail);
		$('#customerPhone').text(customerPhone);
		$('#vehicleName').text(vehicleName);
		$('#licenseNumber').text(licenseNumber);
		$('#rentalPrice').text(rentalPrice);
		$('#deposit').text(deposit);
		$('#startTime').text(startTime);
		$('#endTime').text(endTime);
		if (star != null) {
			$('#rating').html(renderStarRating(star, undefined, false));
		} else {
			$('#rating').html('');
		}
		$('#comment').html(comment);
	});

	$('#cancelBooking').on('show.bs.modal', function (event) {
		let button = $(event.relatedTarget),
			id = button.data('id'),
			name = button.data('vehicle-name'),
			startTime = button.data('start-time'),
			endTime = button.data('end-time');
		$('#br-id').val(id);
		$('#vehicle-name').text(name);
		$('#start-time').text(startTime);
		$('#end-time').text(endTime);
	});

	$('#btnCancelBooking').on('click', function () {
		var bookingReceiptID = $('#br-id').val();

		$.ajax({
			url: `/api/vehicles/bookings/${bookingReceiptID}`,
			type: 'DELETE',
			success: function (data) {
				$('.modal').modal('hide');
				table.ajax.reload();
			},
			error: function (e) {
				toastr.error("Đã có lỗi xảy ra. Phiền bạn thử lại sau");
			}
		});
	});


	// ==============================================================================================================
	// Comment section

	// Render star ratings
	$('.rating').each(function(){ $(this).html(renderStarRating($(this).data('rating'), '#388E3C')); })
	
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
					<p>${data.comment}</p>
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

	// ==============================================================================================================
	// Image section
	let imageIndex = 0;

	function changeImg(){
		$smallCarouselDisplay.addClass('animated fadeOut')
		.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
			$smallCarouselDisplay.removeClass('animated fadeOut')
			.css('background-image', `url('${imageList[imageIndex].Url}')`)
			.addClass('animated fadeIn')
			.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
				$smallCarouselDisplay.removeClass('animated fadeIn')
			});
		});
		
		$bigCarouselDisplay.addClass('animated fadeOut')
		.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
			$bigCarouselDisplay.removeClass('animated fadeOut')
			.css('background-image', `url('${imageList[imageIndex].Url}')`)
			.addClass('animated fadeIn')
			.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', ()=>{
				$bigCarouselDisplay.removeClass('animated fadeIn')
			});
		});
	}

	// ===========================================
	// Small image carousel
	let $smallCarouselDisplay = $('#smallCarouselDisplay');

	// Left change img btn
	$('#smallCarousel .left.carousel-control').click(() => {
		imageIndex = (imageIndex === 0) ? imageList.length -1 : imageIndex - 1;
		changeImg();
	});

	// Right change img btn
	$('#smallCarousel .right.carousel-control').click(() => {
		imageIndex = (imageIndex === imageList.length -1) ? 0 : imageIndex + 1;
		changeImg();
	});

	// ============================================
	// Big image carousel rendering
	var	$bigCarousel = $('#bigCarousel'),
		$bigCarouselDisplay = $('#bigCarouselDisplay');

	changeImg();

	// Open big carousel on clicking a small carousel
	$smallCarouselDisplay.click(() => {
		$bigCarousel.addClass('active');
		$('body').addClass('modal-open');
	})

	// bind the carousel's controllers
	$bigCarousel.find('.fa-times').click(()=>{
		$bigCarousel.removeClass('active');
		$('body').removeClass('modal-open');
	});
	$bigCarousel.find('.left.carousel-control').click(() => {
		imageIndex = (imageIndex === 0) ? imageList.length -1 : imageIndex - 1;
		changeImg();
	});
	$bigCarousel.find('.right.carousel-control').click(() => {
		imageIndex = (imageIndex === imageList.length -1) ? 0 : imageIndex + 1;
		changeImg();
	});

	// bind esc button
	$(document).keyup(function(e){
		if(e.keyCode === 27){
			$bigCarousel.removeClass('active');
			$('body').removeClass('modal-open');
		}
	});


	// ==============================================================================================================
	// Edit vehicle's info section

	// Button to toggle between display mode and edit mode
	$('#editInfoBtn').click(function () {
		$('.display-control').css('display', 'none');
		$('.edit-control').css('display', 'inherit');
	});

	// Cancel change. Reset all inputs
	$('#cancelChangeBtn').click(function () {

		$('#vehicleNameInput').val($('#vehicleNameInput').data('default'));
		$('#licenseNumberInput').val($('#licenseNumberInput').data('default'));
		$('#garageIDInput').val($('#garageIDInput').data('default')).trigger("change");
		$('#vehicleGroupIDInput').val($('#vehicleGroupIDInput').data('default')).trigger("change");
		$('#engineInput').val($('#engineInput').data('default'));
		$('#transmissionDetailInput').val($('#transmissionDetailInput').data('default'));
		$('input[name="colorInput"][data-default="True"]').prop('checked', true);
		$('#descriptionInput').val($('#descriptionInput').data('default'));

		$('.edit-control').css('display', 'none');
		$('.display-control').css('display', 'inherit');
	});

	$('#saveChangeBtn').click(() => {
		if (!$("#vehicleNameInput")[0].checkValidity()) // Check Name : required
			return toastr.warning('Tên xe không được để trống.');
		
		if (!$("#licenseNumberInput")[0].checkValidity()) // Check License: required
			return toastr.warning('Biển số xe không được để trống');

		let updateModel = {
			Name: $('#vehicleNameInput').val()
			, LicenseNumber: $('#licenseNumberInput').val()
			, GarageID: $('#garageIDInput').val()
			, VehicleGroupID: $('#vehicleGroupIDInput').val()
			, Engine: $('#engineInput').val()
			, TransmissionDetail: $('#transmissionDetailInput').val()
			, Color: $('input[name="colorInput"]:checked').val()
			, Description: $('#descriptionInput').val()
		};

		$.ajax({
			type: "PATCH",
			url: `/api/vehicles/${VEHICLE_ID}`,
			data: updateModel,
			success: (data) => {
				if(data.message)
					toastr.error(data.message);
				else
					location.reload();
			},
			error: () => {
				toastr.error("Chỉnh sửa thất bại. Vui lòng thử lại sau");
			}
		});
	});

	// =====================================
	// Validate on change
	$('#vehicleNameInput').focusout(function(){
		if(!$(this)[0].checkValidity())
			toastr.warning('Tên xe không được để trống.');
	})

	$('#licenseNumberInput').focusout(function(){
		if(!$(this)[0].checkValidity())
			toastr.warning('Biển số xe không được để trống.');
	})

	// =====================================
	// Initiate select2

	$('#garageIDInput').select2({
		placeholder: "Vui lòng chọn garage..." 
		, width: '100%'
	})
	.on('select2:close', () => {
		$('#garageIDInput')[0].checkValidity() || toastr.warning('Garage không được để trống.');
	})

	$('#vehicleGroupIDInput').select2({
		allowClear: true
		, placeholder: "Vui lòng chọn nhóm xe..."
		, width: '100%'
	})

	// ==============================================================================================================
	// Image uploading

	$('#dropzoneForm').dropzone({
		acceptedFiles: "image/jpeg,image/png,image/gif"
		, dictDefaultMessage: "Thả ảnh hoặc nhấn vào đây để upload."
		, dictFileTooBig: 'Dung lượng ảnh phải dưới {{maxFilesize}} mb.'
		, dictInvalidFileType: 'Không phải file ảnh.'
		, dictMaxFilesExceeded: 'Chỉ được upload tối đa 10 ảnh.'
		, dictRemoveFile: 'Xóa'
		, maxFiles: 10
		, maxFilesize: 1
		, parallelUploads: 1
		, uploadMultiple: false

		, init: function () {
			var myDropzone = this;

			this.on('success', function (file, response) {
				// The id for deleting img by clicking delete btn
				file.Id = response.Id;

				// Add it into img list
				imageList.push(response);
			});

			this.on('addedfile', (file) => {
				// Create the remove button
				var removeButton = Dropzone.createElement('<div class="text-center m-t"><button class="btn btn-danger">Xóa</button></div>');

				// Listen to the click event
				removeButton.addEventListener('click',(e) => {
					e.preventDefault();
					e.stopPropagation();

					// At least leave 4 img behind
					if(imageList.length > 4){
						if(file.Id) {
							$.ajax({
								type: "DELETE",
								url: `/api/vehicles/images/${file.Id}`,
								success: (data) => {
									this.removeFile(file);

									// Remove it from img list
									imageList = imageList.filter(img => img.Id != file.Id );

									// Increase maxFiles if the deleted file has already existed beforehand
									if(file.isSenpai)
										this.options.maxFiles++;

									// Change the img displayed on carousels
									changeImg();

									toastr.success('Xóa ảnh thành công.')
								},
								error: function (data) {
									toastr.error('Xóa ảnh thất bại. Vui lòng thử lại sau.')
								}
							});
						} else {
							this.removeFile(file);
						}
					} else {
						toastr.warning('Bạn phải có ít nhất 4 ảnh cho mỗi xe.')
					}
				});

				// Add the button to the file preview element.
				file.previewElement.appendChild(removeButton);
			});

			// Add existed imgs into review
			imageList.map(image => {
				image.isSenpai = true;
				this.emit("addedfile", image);

				this.createThumbnailFromUrl(image, image.Url, undefined, true);

				// Make sure that there is no progress bar, etc...
				this.emit("complete", image);

				// Reduce the allowed num of uploading img
				this.options.maxFiles--;

				return image;
			})
		}
	})


	// ==============================================================================================================
	// Delete vehicle

	$('#deleteVehicleBtn').click(() => $.ajax({
		type: "DELETE",
		url: `/api/vehicles/${VEHICLE_ID}`,
		success: () => {
			window.location.pathname = "/management/vehicleManagement";
		},
		error: () => {
			toastr.warning('Xoá thất bại. Bạn vui lòng thử lại sau.')
		}
	}));


	// ==============================================================================================================
	// Create new booking

	// Start time
	$(startTimeInput).datetimepicker({
		useCurrent: false,
		minDate: moment(),
		format: 'YYYY/MM/DD HH:mm',
		locale: 'vi',
		ignoreReadonly: true,
	})
	.on('dp.hide', (data)=>{
		if(data.date.isAfter($(endTimeInput).data('DateTimePicker').date())){
			let newEndTime = data.date.clone().add(1, 'days')
			$(endTimeInput).data('DateTimePicker').date(newEndTime);
		}
	})

	// End time
	$(endTimeInput).datetimepicker({
		useCurrent: false,
		minDate: moment(),
		format: 'YYYY/MM/DD HH:mm',
		locale: 'vi',
		ignoreReadonly: true,
	})
	.on('dp.hide', (data)=>{
		if(data.date.isBefore($(startTimeInput).data('DateTimePicker').date())){
			let newStartTime = data.date.clone().subtract(1, 'days')
			$(startTimeInput).data('DateTimePicker').date(newStartTime);
		}
	})

	$('#createSelfBooking').on('show.bs.modal', function (event) {
		// Set default day for datetimepickers on showing modal
		$(startTimeInput).data('DateTimePicker').date(moment());
		$(endTimeInput).data('DateTimePicker').date(moment().add(1, 'days'));
	});

	$('#createSelfBookingBtn').click((evt) => {
		$.ajax({
			url: `/api/vehicles/bookings`,
			data: {
				vehicleID: VEHICLE_ID,
				startTime: $(startTimeInput).data('DateTimePicker').date().toJSON(),
				endTime: $(endTimeInput).data('DateTimePicker').date().toJSON(),
			},
			type: 'POST',
			success: (data) => {
				if(data.isSuccess){
					$('.modal').modal('hide');
					table.ajax.reload();
					toastr.success('Tạo đặt xe mới thành công.')
				} else {
					toastr.error(data.errorMessage);
				}
			},
			error: (e) => {
				toastr.error("Đã có lỗi xảy ra. Phiền bạn thử lại sau");
			}
		});
	});
});