const bookingTableColumns = [
	{ name: 'ID', data: 'ID', visible: false, orderable: false, searchable: false }
	, { name: 'CustomerName', title: 'Tên khách hàng', data: 'CustomerName' }
	, { name: 'CustomertEmail', data: 'CustomertEmail', visible: false, orderable: false, searchable: false }
	, { name: 'CustomerPhone', data: 'CustomerPhone', visible: false, orderable: false, searchable: false }
	, { name: 'VehicleID', data: 'VehicleID', visible: false, orderable: false, searchable: false }
	, { name: 'VehicleName', title: 'Tên xe', data: 'VehicleName' }
	, { name: 'LicenseNumber', title: 'Biển số', data: 'LicenseNumber' }
	, { name: 'RentalPrice', title: 'Giá thuê', data: 'RentalPrice' }
	, { name: 'Deposit', title: 'Đặt cọc', data: 'Deposit' }
	, { name: 'StartTime', title: 'Thuê từ', data: 'StartTime' }
	, { name: 'EndTime', title: 'Thuê đến', data: 'EndTime' }
	, { name: 'Star', title: "Đánh giá", data: 'Star', width: '6.5em' }
	, { name: 'Comment', data: 'Comment', visible: false, orderable: false, searchable: false }
	, { name: 'IsInThePast', data: 'IsInThePast', visible: false, orderable: false, searchable: false }
	, { name: 'IsCanceled', data: 'IsCanceled', visible: false, orderable: false, searchable: false }
	, { name: 'IsSelfBooking', data: 'IsSelfBooking', visible: false, orderable: false, searchable: false }
	, { name: 'Type', title: "Tình trạng", orderable: false, searchable: false }
	, { name: 'Action', title: "Thao tác", orderable: false, searchable: false }
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

let table = null;

$(document).ready( function () {
	let garageID = null;
	let isCanceled = true;
	let isSelfBooking = true;
	let isInThePast = null;

	if ($('#byGarage').is(':checked')) {
		garageID = parseInt($('#garageID').val());
	} else {
		garageID = null;
	}

	table = $(bookings).DataTable({
		dom: "lftipr"
		, serverSide: true
		, ajax: {
			url: queryApiUrl
			, data: (rawData) => {
				return {
					Draw: rawData.draw,
					Search: rawData.search.value,
					GarageID: garageID,
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
		select: {
			selector: 'td:not(:last-child)',
			style: 'multi+shift'
		},
		//"iDisplayLength": 10,
		columns: bookingTableColumns,
		columnDefs: [
			{
				targets: 5,
				render: function (data, type, row) {
					if (row.VehicleID != null) {
						return `<a href="/management/vehicleManagement/${row.VehicleID}">${data}</a>`;
					}
					return data;
				}
			},
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

	$('#byGarage').on('change', function () {
		if ($('#byGarage').is(':checked')) {
			$('#garageID').removeAttr("disabled");
			garageID = parseInt($('#garageID').val());
		} else {
			$('#garageID').attr('disabled', 'disabled');
			garageID = null;
		}
		table.ajax.reload();
	});

	$('#garageID').on('change', function () {
		garageID = parseInt($('#garageID').val());
		table.ajax.reload();
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
});