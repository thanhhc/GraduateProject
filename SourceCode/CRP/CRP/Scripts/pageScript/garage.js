const vehicleTableColumns = [
	{ name: 'ID', visible: false, orderable: false, searchable: false }
	, { name: 'Name', title: 'Tên' }
    , { name: 'LicenseNumber', title: 'Biển số' }
    , { name: 'VehicleGroupName', title: 'Nhóm', defaultContent: '-chưa có nhóm-' }
    , { name: 'Year', title: 'Năm' }
    , { name: 'NumOfSeat', title: 'Số chỗ' }
	, { name: 'Star', title: "Đánh giá", width: '6.5em' }
	, { name: 'Action', title: "Thao tác", orderable: false, searchable: false, width: '6em' }
]

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
let star = parseFloat($('#star').val());
const defaultStar = parseFloat($('#star').val());
let garageID = parseInt($('#garageID').val());
let defaultData = {};

defaultData.Name = $('#garageName').val();
defaultData.LocationID = $('#locationID').val();
defaultData.Address = $('#gAddress').val();
defaultData.Email = $('#gEmail').val();
defaultData.Phone1 = $('#gPhone1').val();
defaultData.Phone2 = $('#gPhone2').val();
defaultData.Description = $('#gDescription').val();
defaultData.Policy = $('#gPolicy').val();
//defaultData.GarageWorkingTimes = workTable;

$(document).on('click', '#btnEditGarage', function () {
    $('.display-control').css('display', 'none');
    $('.edit-control').css('display', 'inherit');
});

$(document).on('click', '#cancelChange', function () {
    $('.display-control').css('display', 'inherit');
    $('.edit-control').css('display', 'none');

    // set default value
    $('#garageName').val(defaultData.Name);
    $('#locationID').val(defaultData.LocationID).trigger("change");
    $('#gAddress').val(defaultData.Address);
    $('#gEmail').val(defaultData.Email);
    $('#gPhone1').val(defaultData.Phone1);
    $('#gPhone2').val(defaultData.Phone2);
    $('#gDescription').val(defaultData.Description);
    $('#gPolicy').val(defaultData.Policy);
    renderActivation();
    renderWorkingTime(garageID, true);
});

$(document).ready(function () {
    $('#locationID').select2({
        width: '100%',
    });

    $('#btnEditGarage').on('click', function () {
        $('.edit-control').css('display', 'inherit');
        $('.display-control').css('display', 'none');
    });
    renderActivation();

	// ============================================
	// Vehicle table

	renderWorkingTime(garageID, false);
	renderWorkingTime(garageID, true);

	// Load vehicles belonging to this garage
	table = $(vehicles).DataTable({
	    dom: 'lftipr',
	    ajax: {
	        url: `/api/vehicleInGarage/${garageID}`,
	        type: 'GET',
	    },
        language: viDatatables,
	    select: {
	        selector: 'td:not(:last-child)',
	        style: 'multi+shift'
	    },
	    //"iDisplayLength": 10,
	    columns: vehicleTableColumns,
	    columnDefs: [
            {
                targets: 1,
                render: function (data, type, row) {
                    return `<a href="/management/vehicleManagement/${row[0]}">${data}</a>`;
                }
            },
            {
                targets: -2
				, render: function(data, type, row) {
					if (type === 'display') {
						if (row[7] > 0) {
							return renderStarRating(data);
						}
						
						return '-';
					}
					return data;
				}
            },
			{
				// Render action button
				targets: -1,
				render: (data, type, row) => {
				    var changeGarage = `<a data-toggle="modal" data-target="#changeGarage" data-vehicle-id="${row[0]}" class="btn btn-primary"><i class="fa fa-tag"></i> Đổi garage</a>`;
					return changeGarage;
				}
			}
		],
	});

	let isCanceled = true;
	let isSelfBooking = true;
	let isInThePast = null;

	let tableBooking = $(bookings).DataTable({
	    dom: "lftipr"
		, serverSide: true
		, ajax: {
		    url: queryBookingApiUrl
			, data: (rawData) => {
			    return {
			        Draw: rawData.draw,
			        Search: rawData.search.value,
			        GarageID: garageID,
			        IsCanceled: isCanceled,
			        IsSelfBooking: isSelfBooking,
			        IsInThePast: isInThePast
					, RecordPerPage: rawData.length
					, Page: rawData.start / rawData.length + 1
					, OrderBy: bookingTableColumns[rawData.order[0].column].data
					, IsDescendingOrder: rawData.order[0].dir == 'desc'
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
				    if (!row.IsCanceled && !row.IsSelfBooking && row.IsInThePast) {
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
				    return info + " " + del;
				}
			}
	    ]
	});

	$('#listAdd').on('click', function () {
	    $.ajax({
	        url: `/api/vehicleListGarage/${garageID}`,
	        type: "GET",
	        success: function (data) {
	            var options = "";
	            $.each(data.list, function (k, v) {
	                options += "<option value='" + v.Value + "'>" + v.Text + "</option>";
	            });
	            $("#drpVehicle").html(options);
	            $('#drpVehicle').select2({
	                width: '100%',
	            });
	        },
	        error: function () {
	            toastr.error("Đã có lỗi xảy ra. Phiền bạn thử lại sau");
	        }
	    });
	});

	$('#btnAddVehicle').on('click', function () {
	    var vehicleID = $('#drpVehicle').val();

	    $.ajax({
	        url: `/api/garage/updateVehicle/${vehicleID}/${garageID}`,
	        type: 'PATCH',
	        success: function (data) {
	            if (data.result) {
	                $('.modal').modal('hide');
	                table.ajax.reload();
	            } else {
	                toastr.error("Cập nhật không thành công. Xin vui lòng thử lại");
	            }
	        },
	        error: function (e) {
	            toastr.error("Đã có lỗi xảy ra. Phiền bạn thử lại sau");
	        }
	    });
	});

	$('#changeGarage').on('show.bs.modal', function (event) {
	    let button = $(event.relatedTarget),
	        id = button.data('vehicle-id');
	    $('#v-id').val(id);

	    $.ajax({
	        url: `/api/listOtherGarage/${garageID}`,
	        type: "GET",
	        success: function (data) {
	            var options = "";
	            $.each(data.list, function (k, v) {
	                options += "<option value='" + v.Value + "'>" + v.Text + "</option>";
	            });
	            $("#drpGarage").html(options);
	            $('#drpGarage').select2({
	                width: '100%',
	            });
	        },
	        error: function () {
	            toastr.error("Đã có lỗi xảy ra. Phiền bạn thử lại sau");
	        }
	    });
	});

	$('#btnChangeGarage').on('click', function () {

	    var vehicleID = $('#v-id').val();
	    var oGarageID = $('#drpGarage').val();

	    $.ajax({
	        url: `/api/garage/updateVehicle/${vehicleID}/${oGarageID}`,
	        type: 'PATCH',
	        success: function (data) {
	            if (data.result) {
	                $('.modal').modal('hide');
	                table.ajax.reload();
	            } else {
	                toastr.error("Cập nhật không thành công. Xin vui lòng thử lại");
	            }
	        },
	        error: function (e) {
	            toastr.error("Đã có lỗi xảy ra. Phiền bạn thử lại sau");
	        }
	    });
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

	$('#customModal').on('show.bs.modal', function (event) {
	    let button = $(event.relatedTarget),
			action = button.data('action');

	    switch (action) {
	        case 'deactivateGarage': {
	            renderConfirmModal('', 'garage', 'deactivate', this, [{ id: garageID, name: $('#garageNameD').val(), defaultStar: defaultStar }]);
	        }
	            break;
	        case 'reactivateGarage': {
	            renderConfirmModal('', 'garage', 'reactivate', this, [{ id: garageID, name: $('#garageNameD').val(), defaultStar: defaultStar }]);
	        }
	            break;
	        case 'deleteGarage': {
	            renderConfirmModal('', 'garage', 'delete', this, [{ id: garageID, name: $('#garageNameD').val() }]);
	        }
	    }
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
	    tableBooking.ajax.reload();
	});

	$('#saveChange').on('click', function () {
	    let workTable = [];

	    for (var i = 0; i < 7; i++) {
	        if (!$(`.work-start:eq(${i})`).val() && $(`.work-end:eq(${i})`).val()) {
	            toastr.error("Vui lòng nhập thời gian mở cửa");
	            return false;
	        }
	        if ($(`.work-start:eq(${i})`).val() && !$(`.work-end:eq(${i})`).val()) {
	            toastr.error("Vui lòng nhập thời gian đóng cửa");
	            return false;
	        }
	        if ($(`.work-start:eq(${i})`).val() && $(`.work-end:eq(${i})`).val()) {
	            var startStr = $(`.work-start:eq(${i})`).val().split(":");
	            var endStr = $(`.work-end:eq(${i})`).val().split(":");
	            var startTimeInMinute = parseInt(startStr[0]) * 60 + parseInt(startStr[1]);
	            var endTimeinMinute = parseInt(endStr[0]) * 60 + parseInt(endStr[1]);
	            if (startTimeInMinute > endTimeinMinute) {
	                toastr.error("Xin lỗi, thời gian đóng cửa không được sớm hơn thời gian mở cửa");
	                return false;
	            }
	            if (startTimeInMinute > 1440 || endTimeinMinute > 1440 || parseInt(startStr[1]) > 59 || parseInt(endStr[1]) > 59) {
	                toastr.error("Xin lỗi, giá trị thời gian không hợp lệ");
	                return false;
	            }
	            var item = {};
	            item.DayOfWeek = i;
	            item.OpenTimeInMinute = startTimeInMinute;
	            item.CloseTimeInMinute = endTimeinMinute;
                workTable.push(item);
	        }
	    }

	    let model = {};
	    model.ID = garageID;
	    model.Name = null;
	    model.LocationID = null;
	    model.Address = null;
	    model.Email = null;
	    model.Phone1 = null;
	    model.Phone2 = null;
	    model.Description = null;
	    model.Policy = null;
	    model.GarageWorkingTimes = workTable;

	    if (!$('#garageName').val()) {
	        toastr.error("Vui lòng nhập tên garage");
	        return false;
	    } else if (!$('#garageName').val().length > 100) {
	        toastr.error("Xin lỗi. Tên của garage vượt quá độ dài quy định");
	        return false;
	    } else {
	        model.Name = $('#garageName').val();
	    }

	    model.LocationID = $('#locationID').val();

	    if (!$('#gAddress').val()) {
	        toastr.error("Vui lòng nhập địa chỉ");
	        return false;
	    } else if ($('#gAddress').val().length > 200) {
	        toastr.error("Xin lỗi. Địa chỉ Vượt quá độ dài quy định");
	        return false;
		} else {
	        model.Address = $('#gAddress').val();
	    }

	    if (!$('#gEmail').val()) {
	        toastr.error("Vui lòng nhập email");
	        return false;
	    } else if (!validateEmail($('#gEmail').val())) {
	        toastr.error("Email không hợp lệ");
	        return false;
        } else {
	        model.Email = $('#gEmail').val();
	    }

	    if (!$('#gPhone1').val()) {
	        toastr.error("Vui lòng nhập số điện thoại");
	        return false;
	    } else if (!validatePhone($('#gPhone1').val())) {
	        toastr.error("Số điện thoại không hợp lệ");
	        return false;
		} else {
	        model.Phone1 = $('#gPhone1').val();
	    }

	    if ($('#gPhone2').val()) {
	        if (!validatePhone($('#gPhone2').val())) {
	            toastr.error("Số điện thoại không hợp lệ");
	            return false;
	        } else {
	            model.Phone2 = $('#gPhone2').val();
	        }
	    }

	    if ($('#gDescription').val()) {
	        if ($('#gDescription').val().length > 1000) {
	            toastr.error("Vượt quá độ dài quy định");
	            return false;
	        }
	        model.Description = $('#gDescription').val();
	    }

	    if ($('#gPolicy').val()) {
	        model.Policy = $('#gPolicy').val();
	    }

	    $.ajax({
	        url: `/api/garages`,
	        type: 'PATCH',
	        data: JSON.stringify(model),
	        contentType: "application/json",
	        dataType: "json",
	        success: function (data) {
	            if (data.result) {
	                window.location.pathname = `management/garageManagement/${garageID}`;
	            } else {
	                toastr.error(data.message);
	            }
	        },
	        error: function () {
	            toastr.error('Đã có lỗi xảy ra. Phiền bạn thử lại sau');
	        }
	    });
        
	});
});

function renderActivation() {
    let isActivateInput = ($('#isActive').val() === 'True');
    let btn = $('#activationBtn');
    let name = $('#displayGarageName');
    let dName = $('#garageNameD').val();
    if (isActivateInput == true) {
        name.removeClass('inactive-bg');
        name.addClass('active-bg');
        name.html(`
                <div class ="col-md-6 m-t m-l m-b" style="font-size: 25px;">
                    <span>${dName}</span>
                    <label class ="label label-primary label-lg">đang hoạt động</label>
                    <span style="font-size: 20px;">${NUM_OF_COMMENT ? renderStarRating(STAR_RATING, 'white') : ''}</span>
                </div>
                
                <div class ="col-md-2 pull-right m-t m-r-lg">
                    <a id="btnEditGarage" class ="btn btn-success"><i class ="fa fa-pencil-square-o"></i><span> Chỉnh sửa thông tin</span></a>
                </div>`);
        btn.attr('data-action', 'deactivateGarage');
        btn.html('Ngừng hoạt động');
        btn.removeClass('btn-success');
        btn.addClass('btn-warning');
    } else {
        name.removeClass('active-bg');
        name.addClass('inactive-bg');
        name.html(`
                <div class ="col-md-6 m-t m-l m-b" style="font-size: 25px;">
                    <span>${dName}</span>
                    <label class ="label label-danger label-lg">ngưng hoạt động</label>
                    <span style="font-size: 20px;">${NUM_OF_COMMENT ? renderStarRating(STAR_RATING, 'white') : ''}</span>
                </div>

                <div class ="col-md-2 pull-right m-t m-r-lg">
                    <a id="btnEditGarage" class ="btn btn-success"><i class ="fa fa-pencil-square-o"></i><span> Chỉnh sửa thông tin</span></a>
                </div>`);
        btn.attr('data-action', 'reactivateGarage');
        btn.html('Tái kích hoạt');
        btn.removeClass('btn-warning');
        btn.addClass('btn-success');
    }
}

function renderWorkingTime(id, isEditable) {
    $.ajax({
        url: `/api/workingTime/${id}`,
        type: 'GET',
        success: function (data) {
            let workingTimeTable = '';
            for (var i = 0; i < 7; i++) {
                workingTimeTable += workDay(searchArray(i, data.list), isEditable);
            }
            if(isEditable) {
                $('#working-time-edit').html(workingTimeTable)
            } else {
                $('#working-time').html(workingTimeTable);
            }

            // disable textbox while check Nghi
            for (let i = 0; i < 7; i++) {
                if ($(`#chk${i}`).is(':checked')) {
                    $(`.work-start:eq(${i})`).prop('disabled', true);
                    $(`.work-end:eq(${i})`).prop('disabled', true);
                } else {
                    $(`.work-start:eq(${i})`).prop('disabled', false);
                    $(`.work-end:eq(${i})`).prop('disabled', false);
                }
                $(`#chk${i}`).change(function () {
                    if ($(this).is(':checked')) {
                        $(`.work-start:eq(${i})`).val("");
                        $(`.work-end:eq(${i})`).val("");
                        $(`.work-start:eq(${i})`).prop('disabled', true);
                        $(`.work-end:eq(${i})`).prop('disabled', true);
                    } else {
                        $(`.work-start:eq(${i})`).prop('disabled', false);
                        $(`.work-end:eq(${i})`).prop('disabled', false);
                        $(`.work-start:eq(${i})`).val("08:00");
                        $(`.work-end:eq(${i})`).val("17:00");
                    }
                });
            }

        },
        error: function(e) {
            toastr.error("Đã có lỗi xả ra. Phiền bạn thử lại sau");
        }
    });
}

function searchArray(value, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][0] === value) {
            return array[i];
        }
    }
    return [value,'',''];
}

function workDay(workArray, isEditable) {

    let textDOW = '';
    if (workArray[0] === 0) {
        textDOW = 'Chủ nhật';
    } else if (workArray[0] === 1) {
        textDOW = 'Thứ hai';
    } else if (workArray[0] === 2) {
        textDOW = 'Thứ ba';
    } else if (workArray[0] === 3) {
        textDOW = 'Thứ tư';
    } else if (workArray[0] === 4) {
        textDOW = 'Thứ năm';
    } else if (workArray[0] === 5) {
        textDOW = 'Thứ sáu';
    } else if (workArray[0] === 6) {
        textDOW = 'Thứ bảy';
    }
    if (workArray[1] !== '' && workArray[2] !== '') {
        var startTime = "";
        var endTime = "";

        startTime = (Math.floor(workArray[1] / 60) >= 10 ? "" + Math.floor(workArray[1] / 60) : "0" + Math.floor(workArray[1] / 60))
            + ":" + ((workArray[1] % 60) >= 10 ? "" + (workArray[1] % 60) : "0" + (workArray[1] % 60));
        endTime = (Math.floor(workArray[2] / 60) >= 10 ? "" + Math.floor(workArray[2] / 60) : "0" + Math.floor(workArray[2] / 60))
            + ":" + ((workArray[2] % 60) >= 10 ? "" + (workArray[2] % 60) : "0" + (workArray[2] % 60));

        if (isEditable) {
            return `
                <div class="input-group">
                    <div class="input-group-addon gray-bg">${textDOW}</div>
                    <div class="input-group-addon">Từ</div>
                    <input type="text" data-mask="99:99" value="${startTime}" class ="work-start form-control">
                    <div class="input-group-addon">Đến</div>
                    <input type="text" data-mask="99:99" value="${endTime}" class ="work-end form-control">
                    <div class ="input-group-addon checkbox"><input type="checkbox" id="chk${workArray[0]}"/><label for="chk${workArray[0]}" style="margin-left: 12px;">Nghỉ</label></div>
                </div>`;
        } else {
            return `
                <div class="input-group">
                    <div class="input-group-addon gray-bg">${textDOW}</div>
                    <div class ="input-group-addon">Từ</div>
                    <div class ="input-group-addon">${startTime}</div>
                    <div class ="input-group-addon">Đến</div>
                    <div class ="input-group-addon">${endTime}</div>
                </div>`;
        }
    } else {
        if (isEditable) {
            return `<div class="input-group">
                        <div class="input-group-addon gray-bg">${textDOW}</div>
                        <div class="input-group-addon">Từ</div>
                        <input type="text" data-mask="99:99" value="" class ="work-start form-control">
                        <div class="input-group-addon">Đến</div>
                        <input type="text" data-mask="99:99" value="" class ="work-end form-control">
                        <div class ="input-group-addon checkbox"><input type="checkbox" id="chk${workArray[0]}" checked/><label for="chk${workArray[0]}" style="margin-left: 12px;">Nghỉ</label></div>
                    </div>`;
        } else {
            return `<div class="input-group">
                <div class ="input-group-addon gray-bg">${textDOW}</div>
                <div class ="input-group-addon" style="padding: 0 93px; background-color:#FFCDD2">Nghỉ</div>
            </div>`;
        }
    }
}