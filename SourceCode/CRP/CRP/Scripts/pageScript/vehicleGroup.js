const vehicleTableColumns = [
	{ name: 'ID', visible: false, orderable: false, searchable: false }
	, { name: 'Name', title: 'Tên' }
    , { name: 'LicenseNumber', title: 'Biển số' }
    , { name: 'GarageName', title: 'Garage' }
    , { name: 'Year', title: 'Năm' }
    , { name: 'NumOfSeat', title: 'Số chỗ' }
	, { name: 'Star', title: "Đánh giá", width: '6.5em' }
	, { name: 'Action', title: "Thao tác", orderable: false, searchable: false, width: '20em' }
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

let table1 = null;
const groupID = $('#groupID').val();
const priceGroupID = $('#priceGroupID').val();

let defaultData = {};
defaultData.Name = $('#groupName').val();
defaultData.PriceGroup = {};
defaultData.PriceGroup.ID = parseInt(priceGroupID);
defaultData.PriceGroup.DepositPercentage = $('#deposit').val();
defaultData.PriceGroup.PerDayPrice = $('#per-day-price').val();
defaultData.PriceGroup.MaxRentalPeriod = $('#max-rent').val();
defaultData.PriceGroup.MaxDistancePerDay = $('#max-distance-day').val();
defaultData.PriceGroup.ExtraChargePerKm = $('#extra-charge-day').val();

$(document).ready(function () {
    $('#drpVehicle').select2({
        width: '100%',
    });
    $('#drpGroup').select2({
        width: '100%',
    });

    $('#priceGroupItemD').DataTable({
        dom: "t",
        ordering: false,
        ajax: {
            url: `/api/priceGroup/${priceGroupID}`,
            type: "GET",
        },
        language: viDatatables,
        columns: [
            {
                title: 'Thời gian (giờ)',
                width: '30%',
                data: "0"
            },
            {
                title: 'Giá tiền (VNĐ)',
                width: '40%',
                data: "1"
            },
            {
                title: 'Số Km tối đa (Km)',
                width: '30%',
                data: "2",
                defaultContent: 'Không giới hạn'
            }
        ]
    });


    table1 = $('#priceGroupItem').DataTable({
        dom: "t",
        displayLength: 23,
        ordering: false,
        ajax: {
            url: `/api/priceGroup/${priceGroupID}`,
            type: "GET",
        },
        columnDefs: [
            {
                // Render action button
                targets: 0,
                render: (data, type, row) => {
                    return `<button type="button" class ="btn btn-danger btn-circle btn-number minus-btn"  data-type="minus">
                                <i class="fa fa-minus"></i>
                            </button>`;
                }
            },
            {
                targets: 1,
                render: (data, type, row) => {
                    return `<input type="number" min="1" max="23" class="max-time form-control" value="${row[0]}" />`;
                }
            },
            {
                targets: 2,
                render: (data, type, row) => {
                    return `<input type="number" class="price form-control" value="${row[1]}" style="width: 120px;" />`;
                }
            },
            {
                targets: 3,
                render: (data, type, row) => {
                    return `<input type="number" min="1" max="2400" class="max-distance form-control" value="${row[2]}" />`;
                }
            },
            {
                targets: 4,
                render: (data, type, row) => {
                    return `<input type="checkbox" class="unlimit-km" />`;
                }
            }
        ],
        language: viDatatables,
        columns: [
            {
                width: '10%'
            },
            {
                title: 'Thời gian (giờ)',
                width: '15%',
                data: "0"
            },
            {
                title: 'Giá tiền (VNĐ)',
                width: '30%',
                data: "1"
            },
            {
                title: 'Số Km tối đa (Km)',
                width: '20%',
                data: "2"
            },
            {
                title: 'Không giới hạn số Km tối đa',
                width: '25%',
            }
        ],
        initComplete: function (settings, json) {
            if ($('.max-time').length == 0) {
                table1.destroy();
                table1 = null;
                $('#priceGroupItem').empty();
            }
            initCheckboxDatatables();
        }
    });

    renderActivation();
    initCheckbox();

    // listen event change to allow input extra charge
    $('#max-distance-day').on('change', function () {
        allowExtraCharge();
    });

	// ============================================
	// Load vehicles belonging to this group
	let table = $(vehicles).DataTable({
		//data: mockupData,
	    dom: 'ltipr',
	    ajax: {
	        type: "GET",
	        url: `/api/vehiclesInGroup/${groupID}`,
	    },
		lengthMenu: [ 10, 25, 50 ],
		processing: true,
		select: {
			selector: 'td:not(:last-child)',
			style: 'multi+shift'
		},
        language: viDatatables,
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
				    var changeGroup = `<a data-toggle="modal" data-target="#changeGroup" data-vehicle-id="${row[0]}" class="btn btn-primary"><i class="fa fa-tag"></i> Đổi nhóm</a>`;
				    var delFromGroup = `<a data-toggle="modal" data-target="#deleteFromGroup" data-vehicle-id="${row[0]}" data-vehicle-name="${row[1]}" class="btn btn-warning"><i class="fa fa-times"></i> Xóa khỏi nhóm</a>`;
					return changeGroup + " " + delFromGroup;
				}
			}
		],
        columns: vehicleTableColumns
	});

	$('#listAdd').on('click', function () {
	    $.ajax({
	        url: `/api/vehicleList/${groupID}`,
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
	            toastr.error("Đã có lỗi xả ra. Phiền bạn thử lại sau");
	        }
	    });
	});

	$('#btnAddVehicle').on('click', function () {
	    var vehicleID = $('#drpVehicle').val();

	    $.ajax({
	        url: `/api/vehicleGroup/updateVehicle/${vehicleID}/${groupID}`,
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
	            toastr.error("Đã có lỗi xả ra. Phiền bạn thử lại sau");
	        }
	    });
	});

	$('#btnChangeGroup').on('click', function () {
	    
	    var vehicleID = $('#v-id').val();
	    var oGroupID = $('#drpGroup').val();

	    $.ajax({
	        url: `/api/vehicleGroup/updateVehicle/${vehicleID}/${oGroupID}`,
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
	            toastr.error("Đã có lỗi xả ra. Phiền bạn thử lại sau");
	        }
	    });
	});

	$('#btnDeleteVehicleFromGroup').on('click', function () {
	    var vehicleID = $('#v-id').val();
	    var oGroupID = 0;

	    $.ajax({
	        url: `/api/vehicleGroup/updateVehicle/${vehicleID}/${oGroupID}`,
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
	            toastr.error("Đã có lỗi xả ra. Phiền bạn thử lại sau");
	        }
	    });
	});

	// Custom modal's content renders dynamically
	$('#customModal').on('show.bs.modal', function (event) {
	    let button = $(event.relatedTarget),
			action = button.data('action');
		switch(action){
			
			case 'deactivateCarGroup': {
			    renderConfirmModal('','vehicleGroupDetail', 'deactivate', this, [{ id: $('#groupID').val(), name: $('#groupNameD').val() }]);
			}
			    break;
			case 'reactivateCarGroup': {
			    renderConfirmModal('','vehicleGroupDetail', 'reactivate', this, [{ id: $('#groupID').val(), name: $('#groupNameD').val() }]);
			}
			    break;
		    case 'deleteVehicleGroup': {
		        renderConfirmModal('', 'vehicleGroupDetail', 'delete', this, [{ id: $('#groupID').val(), name: $('#groupNameD').val() }]);
		    }
		}
	});

	$('#changeGroup').on('show.bs.modal', function (event) {
	    let button = $(event.relatedTarget),
	        id = button.data('vehicle-id');
	    $('#v-id').val(id);
	});
	$('#deleteFromGroup').on('show.bs.modal', function (event) {
	    let button = $(event.relatedTarget),
            id = button.data('vehicle-id'),
	        name = button.data('vehicle-name');
	    $('#v-id').val(id);
	    $('#vehicle-name').text(name);
	});

});

// display percent
$('#depositDisplay').val($('#deposit').val() * 100);

$('#depositDisplay').on('focusout', function () {
    $('#deposit').val(parseFloat($('#depositDisplay').val() / 100));
});

$(document).on('click', '#btnEditGroup', function () {
    $('.display-control').css('display', 'none');
    $('.edit-control').css('display', 'inherit');
});

$(document).on('click', '#cancelChange', function () {
    $('.display-control').css('display', 'inherit');
    $('.edit-control').css('display', 'none');

    $('#groupName').val(defaultData.Name);
    $('#deposit').val(defaultData.PriceGroup.DepositPercentage);
    $('#per-day-price').val(defaultData.PriceGroup.PerDayPrice);
    $('#max-rent').val(defaultData.PriceGroup.MaxRentalPeriod);
    $('#max-distance-day').val(defaultData.PriceGroup.MaxDistancePerDay);
    $('#extra-charge-day').val(defaultData.PriceGroup.ExtraChargePerKm);

    // reRender bang gia thue xe theo gio
    table1.destroy();
    table1 = null;
    $('#priceGroupItem').empty();
    table1 = $('#priceGroupItem').DataTable({
        dom: "t",
        displayLength: 23,
        ordering: false,
        ajax: {
            url: `/api/priceGroup/${priceGroupID}`,
            type: "GET",
        },
        columnDefs: [
            {
                // Render action button
                targets: 0,
                render: (data, type, row) => {
                    return `<button type="button" class ="btn btn-danger btn-circle btn-number minus-btn"  data-type="minus">
                                <i class="fa fa-minus"></i>
                            </button>`;
                }
            },
            {
                targets: 1,
                render: (data, type, row) => {
                    return `<input type="number" min="1" max="23" class="max-time form-control" value="${row[0]}" />`;
                }
            },
            {
                targets: 2,
                render: (data, type, row) => {
                    return `<input type="number" class="price form-control" value="${row[1]}" style="width: 120px;" />`;
                }
            },
            {
                targets: 3,
                render: (data, type, row) => {
                    return `<input type="number" min="1" max="2400" class="max-distance form-control" value="${row[2]}" />`;
                }
            },
            {
                targets: 4,
                render: (data, type, row) => {
                    return `<input type="checkbox" class="unlimit-km" />`;
                }
            }
        ],
        language: viDatatables,
        columns: [
            {
                width: '10%'
            },
            {
                title: 'Thời gian (giờ)',
                width: '15%',
                data: "0"
            },
            {
                title: 'Giá tiền (VNĐ)',
                width: '30%',
                data: "1"
            },
            {
                title: 'Số Km tối đa (Km)',
                width: '20%',
                data: "2"
            },
            {
                title: 'Không giới hạn số Km tối đa',
                width: '25%',
            }
        ],
        initComplete: function (settings, json) {
            if ($('.max-time').length == 0) {
                table1.destroy();
                table1 = null;
                $('#priceGroupItem').empty();
            }
            initCheckboxDatatables();
        }
    });

    renderActivation();
    initCheckbox();
});

$(document).on('click','.plus-btn', function () {
    if (table1 == null) {
        table1 = $('#priceGroupItem').DataTable({
            dom: "t",
            displayLength: 23,
            ordering: false,
            columnDefs: [
                {
                    // Render action button
                    targets: 0
                    , render: (data, type, row) => {
                        return `
    <button type="button" class ="btn btn-danger btn-circle btn-number minus-btn"  data-type="minus">
    <i class="fa fa-minus"></i>
    </button>`;
                    }
                }
            ],
            language: viDatatables,
            columns: [
                {
                    width: '10%'
                },
                {
                    title: 'Thời gian (giờ)',
                    width: '15%',
                    data: "0"
                },
                {
                    title: 'Giá tiền (VNĐ)',
                    width: '30%',
                    data: "1"
                },
                {
                    title: 'Số Km tối đa (Km)',
                    width: '20%',
                    data: "2"
                },
                {
                    title: 'Không giới hạn số Km tối đa',
                    width: '25%',
                }
            ]
        });
    }
    // limit 23 row
    if ($('.max-time').length < 23) {
        table1.row.add([
            ``,
            ``,
            ``,
            ``,
        ]).draw();
        initCheckboxDatatables();
    }
});

$(document).on('click', '.minus-btn', function () {
    table1.row($(this).parents('tr')).remove().draw();
    if ($('.max-time').length == 0) {
        table1.destroy();
        table1 = null;
        $('#priceGroupItem').empty();
    }
});

$(document).on('click', '#saveChange', function () {
    let priceGroupItemList = [];
    let checkTimeArray = [];
    for (var i = 0; i < $('.max-time').length; i++) {
        if ($(`.max-time:eq(${i})`).val() && !$(`.price:eq(${i})`).val()) {
            toastr.error("Vui lòng nhập giá tiền");
            return false;
        }
        if (!$(`.max-time:eq(${i})`).val() && $(`.price:eq(${i})`).val()) {
            toastr.error("Vui lòng nhập giờ");
            return false;
        }
        if ($(`.max-distance:eq(${i})`).val() && !$(`.max-time:eq(${i})`).val() && !$(`.price:eq(${i})`).val()) {
            toastr.error("Vui lòng nhập giờ và giá tiền");
            return false;
        }
        if ($(`.max-time:eq(${i})`).val() && $(`.price:eq(${i})`).val()) {
            if ($(`.max-time:eq(${i})`).val() != parseInt($(`.max-time:eq(${i})`).val())) {
                toastr.error("Thời gian phải là số nguyên dương");
                return false;
            }
            if ($(`.price:eq(${i})`).val() != parseInt($(`.price:eq(${i})`).val())) {
                toastr.error("Giá tiền phải là số nguyên dương");
                return false;
            }
        }
        if ($(`.max-distance:eq(${i})`).val()) {
            if ($(`.max-distance:eq(${i})`).val() != parseInt($(`.max-distance:eq(${i})`).val())) {
                toastr.error("Số km tối đa phải là số nguyên dương");
                return false;
            }
        }
        if ($(`.max-time:eq(${i})`).val() && $(`.price:eq(${i})`).val()) {
            var item = {};
            item.MaxTime = parseInt($(`.max-time:eq(${i})`).val());
            item.Price = parseInt($(`.price:eq(${i})`).val());
            if ($(`.max-distance:eq(${i})`).val()) {
                item.MaxDistance = parseInt($(`.max-distance:eq(${i})`).val());
                if (item.MaxDistance < 0) {
                    toastr.error("Xin lỗi. Số tiền Km tối đa theo giờ không được âm");
                }
            } else {
                item.MaxDistance = null;
            }

            if (item.MaxTime < 1 || item.MaxTime > 23) {
                toastr.error("Xin lỗi. Số giờ bị sai");
                return false;
            } else {
                if (jQuery.inArray(item.MaxTime, checkTimeArray) >= 0) {
                    toastr.error("Xin lỗi. Không được cấu hình giá một khung giờ nhiều lần");
                    return false;
                } else {
                    if (item.Price < 0) {
                        toastr.error("Xin lỗi. Số tiền không được âm");
                        return false;
                    } else {
                        priceGroupItemList.push(item);
                        checkTimeArray.push(item.MaxTime);
                    }
                }
            }
        }
    }

    let model = {};
    model.ID = parseInt(groupID);
    model.Name = null;
    model.PriceGroup = {};
    model.PriceGroup.ID = parseInt(priceGroupID);
    model.PriceGroup.DepositPercentage = null;
    model.PriceGroup.PerDayPrice = null;
    model.PriceGroup.MaxRentalPeriod = null;
    model.PriceGroup.MaxDistancePerDay = null;
    model.PriceGroup.ExtraChargePerKm = null;

    model.PriceGroup.PriceGroupItems = {};
    model.PriceGroup.PriceGroupItems = priceGroupItemList;

    if (!$('#groupName').val()) {
        toastr.error("Vui lòng nhập tên nhóm");
        return false;
    } else if ($('#groupName').val().length > 50) {
        toastr.error("Xin lỗi. Tên nhóm vượt quá độ dài quy định");
        return false;
    } else {
        model.Name = $('#groupName').val();
    }

    if (!$('#deposit').val()) {
        toastr.error("Vui lòng nhập giá trị đặt cọc");
        return false;
    } else if (parseInt(parseFloat($('#deposit').val()) * 100) !== (parseFloat($('#deposit').val()) * 100)) {
        toastr.error("Xin lỗi. Giá trị đặt cọc phải là số nguyên");
        return false;
    } else if (parseFloat($('#deposit').val()) < 0 || parseFloat($('#deposit').val()) > 1) {
        toastr.error("Xin lỗi. giá trị đặt cọc phải từ 0% đến 100%");
        return false;
    } else {
        model.PriceGroup.DepositPercentage = parseFloat($('#deposit').val());
    }

    if (!$('#per-day-price').val()) {
        toastr.error("Xin vui lòng nhập giá thuê theo ngày");
        return false;
    } else if (parseInt($('#per-day-price').val()) < 0) {
        toastr.error("Xin lỗi. Số tiền không được âm");
        return false;
    } else if ($('#per-day-price').val() != parseInt($('#per-day-price').val())) {
        toastr.error("Xin lỗi. Số tiền phải là số nguyên dương");
        return false;
    } else {
        model.PriceGroup.PerDayPrice = parseInt($('#per-day-price').val());
    }

    if ($('#max-rent').val()) {
        model.PriceGroup.MaxRentalPeriod = parseInt($('#max-rent').val());
        if (model.PriceGroup.MaxRentalPeriod < 0) {
            toastr.error("Xin lỗi. Kì hạn thuê tối đa không được âm");
            return false;
        }
        if (model.PriceGroup.MaxRentalPeriod != $('#max-rent').val()) {
            toastr.error("Xin lỗi. Kì hạn thuê tối đa phải là số nguyên dương");
            return false;
        }
    }
    if ($('#max-distance-day').val()) {
        model.PriceGroup.MaxDistancePerDay = parseInt($('#max-distance-day').val());
        if (model.PriceGroup.MaxDistancePerDay < 0) {
            toastr.error("Xin lỗi số km tối đa không được âm");
            return false;
        }
        if (model.PriceGroup.MaxDistancePerDay != $('#max-distance-day').val()) {
            toastr.error("Xin lỗi số km tối đa phải là số nguyên");
            return false;
        }
    }
    if ($('#extra-charge-day').val()) {
        model.PriceGroup.ExtraChargePerKm = parseInt($('#extra-charge-day').val());
        if (model.PriceGroup.ExtraChargePerKm < 0) {
            toastr.error("Xin lỗi. Số tiền không được âm");
            return false;
        }
        if (model.PriceGroup.ExtraChargePerKm != $('#extra-charge-day').val()) {
            toastr.error("Xin lỗi. Số tiền phải là số nguyên");
            return false;
        }
    }

    $.ajax({
        url: `/api/vehicleGroups`,
        type: 'PATCH',
        data: JSON.stringify(model),
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            if (data.result) {
                window.location.pathname = `management/vehicleGroupManagement/${groupID}`;
            } else {
                toastr.error("Cập nhật không thành công. Xin vui lòng thử lại");
            }
        },
        error: function () {
            toastr.error("Đã có lỗi xảy ra. Xin vui lòng thử lại sau");
        }
    });
});

// Render re/deactivate button
function renderActivation() {
    let isActivateInput = ($('#isActive').val() === 'True');
    let btn = $('#activationBtn');
    let name = $('#displayGroupName');
    let dName = $('#groupNameD').val();
    if (isActivateInput == true) {
        name.removeClass('inactive-bg');
        name.addClass('active-bg');
        name.html(`
                <div class ="col-md-6 m-t m-l m-b" style="font-size: 25px;">
                    <span>${dName}</span>
                    <label class ="label label-primary label-lg">đang hoạt động</label>
                </div>
                <div class ="col-md-2 pull-right m-t m-r-lg">
                    <a id="btnEditGroup" class ="btn btn-success"><i class ="fa fa-pencil-square-o"></i><span> Chỉnh sửa thông tin</span></a>
                </div>`);
        btn.attr('data-action', 'deactivateCarGroup');
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
                </div>
                <div class ="col-md-2 pull-right m-t m-r-lg">
                    <a id="btnEditGroup" class ="btn btn-success"><i class ="fa fa-pencil-square-o"></i><span> Chỉnh sửa thông tin</span></a>
                </div>`);
        btn.attr('data-action', 'reactivateCarGroup');
        btn.html('Tái kích hoạt');
        btn.removeClass('btn-warning');
        btn.addClass('btn-success');
    }
}

//
function initCheckbox() {
    if (!$('#max-rent').val()) {
        $('#max-rent').prop('disabled', true);
        $('#unlimitPeriod').prop('checked', true);
    }
    if (!$('#max-distance-day').val()) {
        $('#max-distance-day').prop('disabled', true);
        $('#unlimitKm').prop('checked', true);
    }

    $('#unlimitPeriod').change(function () {
        if ($('#unlimitPeriod').is(':checked')) {
            $('#max-rent').val('');
            $('#max-rent').prop('disabled', true);
        } else {
            $('#max-rent').prop('disabled', false);
        }
    });
    $('#unlimitKm').change(function () {
        if ($('#unlimitKm').is(':checked')) {
            $('#max-distance-day').val('');
            $('#max-distance-day').prop('disabled', true);
        } else {
            $('#max-distance-day').prop('disabled', false);
        }
        allowExtraCharge();
    });
}

function initCheckboxDatatables() {
    for (var i = 0; i < $('.max-distance').length; i++) {
        if (!$(`.max-distance:eq(${i})`).val()) {
            $(`.max-distance:eq(${i})`).prop('disabled', true);
            $(`.unlimit-km:eq(${i})`).prop('checked', true);
        }
    }
    $('.unlimit-km').change(function () {
        var index = $('.unlimit-km').index(this);
        if ($(`.unlimit-km:eq(${index})`).is(':checked')) {
            $(`.max-distance:eq(${index})`).val('');
            $(`.max-distance:eq(${index})`).prop('disabled', true);
        } else {
            $(`.max-distance:eq(${index})`).prop('disabled', false);
        }
        allowExtraCharge();
    });
    $('.max-distance').on('change', function () {
        allowExtraCharge();
    });
}

function allowExtraCharge() {
    var allowExtraCost = false;
    for (var i = 0; i < $('.unlimit-km').length; i++) {
        if ($(`.max-distance:eq(${i})`).val()) {
            allowExtraCost = true;
        }
    }
    if ($('#max-distance-day').val()) {
        allowExtraCost = true;
    }

    if (allowExtraCost) {
        $('#extra-charge-day').prop('disabled', false);
    } else {
        $('#extra-charge-day').prop('disabled', true);
    }
}