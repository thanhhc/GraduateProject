const vehicleGroupTableColumns = [
			{ name: 'ID', visible: false },
			{ name: 'Name', title: 'Tên nhóm', width: '20%' },
			{ name: 'Maxrent', title: 'Kỳ hạn thuê tối đa', width: '20%', defaultContent: "-" },
			{ name: 'Deposit', title: 'Đặt cọc', width: '10%' },
            { name: 'PerDayPrice', title: 'Giá theo ngày', width: '15%' },
			{ name: 'NumOfCar', title: 'Số lượng xe', width: '10%' },
			{ name: 'Status', title: 'Trạng thái', width: '15%' },
			{
			    title: 'Thao tác',
			    width: '10%',
			    orderable: false,
			    searchable: false
			}
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
$(document).ready(() =>{
	// Render table
	table = $('#garages').DataTable({
        dom: "lftipr",
        ajax: {
            url: "/api/vehicleGroups",
            type: "GET",
        },
        language: viDatatables,
        order: [[ 1, "asc" ]],
        columnDefs: [
            {
                targets: 1,
                render: function (data, type, row) {
                    return `<a href="/management/vehicleGroupManagement/${row[0]}">${data}</a>`;
                }
            },
			{
				// Render status label
				targets: -2,
				render: (data, type, row) => {
					return `<div class="status-label" >
						<p class="label label-${data ? 'primary': 'danger'}">${data ? 'đang hoạt động': 'ngưng hoạt động'}</p>
					</div>`;
				}
			},
			{
				// Render action button
				targets: -1,
				render: (data, type, row) => {
				    return `<div class="btn-group" >
						<button data-toggle="dropdown" class="btn btn-info dropdown-toggle" aria-expanded="false">
							<i class="fa fa-gear"></i> Thao tác <i class="caret"></i>
						</button>
						<ul class="dropdown-menu">
							<li><a href="/management/vehicleGroupManagement/${row[0]}">Thông tin chi tiết</a></li>
                        ${row[6] === true?
                        `<li><a data-toggle="modal" data-target="#mdModal" data-action="deactivate" data-id="${row[0]}" data-name="${row[1]}" >Ngừng hoạt động</a></li>`:
                        `<li><a data-toggle="modal" data-target="#mdModal" data-action="activate" data-id="${row[0]}" data-name="${row[1]}" >Tái kích hoạt</a></li>`
							}
                        <li><a href="#" data-toggle="modal" data-target="#mdModal" data-action="delete" data-id="${row[0]}" data-name="${row[1]}" >Xóa</a></li>
						</ul>
					</div>`;
				}
			}
		],
		columns: vehicleGroupTableColumns,
	});
    
	// Render confirmation modal for actions
	$('#mdModal').on('show.bs.modal', function(event) {
		let button = $(event.relatedTarget),
			action = button.data('action')
			id = button.data('id'),
			name = button.data('name');
			switch (action) {
			    case "activate": {
			        renderConfirmModal(table, 'vehicle group', 'reactivate', this, [{ id: button.data('id'), name: button.data('name') }]);
			    } break;
			    case "deactivate": {
			        renderConfirmModal(table, 'vehicle group', 'deactivate', this, [{ id: button.data('id'), name: button.data('name') }]);
			    } break;
			    case "delete": {
			        renderConfirmModal(table, 'vehicle group', 'delete', this, [{ id: button.data('id'), name: button.data('name') }]);
			    } break;
			}
	});
    
    $('#btnAddVehiclePopup').on('click', function () {
        $.ajax({
            type: "GET",
            url: "/management/vehicleGroupManagement/create",
            success: function (data) {
                $('#myModal').html(data);
                let table1 = null;

                function bindMinusBtn() {
                    $('.minus-btn').unbind('click').click(function () {
                        table1.row($(this).parents('tr')).remove().draw();
                        if ($('.max-time').length == 0) {
                            table1.destroy();
                            $('#groupPop').empty();
                            table1 = null;
                        }
                    });
                }
                function bindLimitKm() {
                    $('.unlimit-km').unbind('change').change(function () {
                        var index = $('.unlimit-km').index(this);
                        if ($(`.unlimit-km:eq(${index})`).is(':checked')) {
                            $(`.max-distance:eq(${index})`).val('');
                            $(`.max-distance:eq(${index})`).prop('disabled', true);
                        } else {
                            $(`.max-distance:eq(${index})`).prop('disabled', false);
                        }
                    });
                }
                bindMinusBtn();
                (function bindPlusBtn() {
                    $('.plus-btn').unbind('click').click(function () {
                        if (table1 == null) {
                            table1 = $('#groupPop').DataTable({
                                dom: "ti",
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
                                        searchable: false,
                                        sortable: false,
                                        width: '10%'
                                    },
                                    {
                                        title: 'Thời gian (giờ)',
                                        width: '15%',
                                        data: "MaxTime"
                                    },
                                    {
                                        title: 'Giá tiền (VNĐ)',
                                        width: '30%',
                                        data: "Price"
                                    },
                                    {
                                        title: 'Số Km tối đa (Km)',
                                        width: '20%',
                                        data: "MaxDistance"
                                    },
                                    {
                                        title: 'Không giới hạn số km tối đa',
                                        width: '25%',
                                        data: "Unlimit"
                                    }
                                ]
                            });
                        }
                        // limit 23 row
                        if($('.max-time').length < 23) {
                            table1.row.add({
                                "MaxTime": `<input type="number" min="1" max="23" class="max-time form-control" value="" />`,
                                "Price": `<input type="number" class="price form-control" value="" />`,
                                "MaxDistance": `<input type="number" class="max-distance form-control" disabled />`,
                                "Unlimit": `<input type="checkbox" class="unlimit-km" checked>`,
                            }).draw();
                            bindMinusBtn();
                            bindLimitKm();
                            allowExtraCharge();
                        }
                    });
                })();

                $('#myModal').modal('show');
            },
            eror: function (e) {
            }
        });
    });
});

$(document).on('change', '#max-distance-day', function () {
    allowExtraCharge();
});

$(document).on('change', '.unlimit-km', function () {
    allowExtraCharge();
});

$(document).on('change', '.max-distance', function () {
    allowExtraCharge();
});

// unlimit max rental period
$(document).on('change', '#unlimitPeriod', function () {
    if ($('#unlimitPeriod').is(':checked')) {
        $('#max-rent').val('');
        $('#max-rent').prop('disabled', true);
    } else {
        $('#max-rent').prop('disabled', false);
    }
});

// unlimit max distance per day
$(document).on('change', '#unlimitKm', function () {
    if ($('#unlimitKm').is(':checked')) {
        $('#max-distance-day').val('');
        $('#max-distance-day').prop('disabled', true);
    } else {
        $('#max-distance-day').prop('disabled', false);
    }
    allowExtraCharge();
});

$(document).on('focusout', '#depositDisplay', function () {
    $('#deposit').val(parseFloat($('#depositDisplay').val() / 100));
});

// add to object priceGroupItem
$(document).on('click', "#btnCreate", function () {
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
                if (jQuery.inArray(item.MaxTime,checkTimeArray) >= 0) {
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
    model.Name = null;

    model.PriceGroup = {};
    model.PriceGroup.DepositPercentage = null;
    model.PriceGroup.PerDayPrice = null;
    model.PriceGroup.MaxRentalPeriod = null;
    model.PriceGroup.MaxDistancePerDay = null;
    model.PriceGroup.ExtraChargePerKm = null;
    
    model.PriceGroup.PriceGroupItems = {};
    model.PriceGroup.PriceGroupItems = priceGroupItemList;

    if (!$('#group-name').val()) {
        toastr.error("Vui lòng nhập tên nhóm");
        return false;
    } else if ($('#group-name').val().length > 50) {
        toastr.error("Xin lỗi. Tên nhóm vượt quá độ dài quy định");
        return false;
    } else {
        model.Name = $('#group-name').val();
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
    if($('#max-distance-day').val()) {
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
    //if (model.PriceGroup.PriceGroupItems.length == 0) {
    //    alert("request input price rental");
    //    return false;
    //}


    $.ajax({
        type: "POST",
        url: "/api/vehicleGroups",
        data: JSON.stringify(model),
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            if (data.result) {
                $('.modal').modal('hide');
                table.ajax.reload();
            } else {
                toastr.error("Tạo mới không thành công. Xin vui lòng thử lại");
            }
        },
        error: function (e) {
            toastr.error("Đã có lỗi xảy ra. Xin vui lòng thử lại sau");
        }
    });
});

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