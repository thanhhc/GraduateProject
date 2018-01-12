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
$(document).ready(() => {
    // set toogling dropdown event for filter dropdown buttons
    $('#multiFilter .filter-toggle').on('click', function (event) {
        let dropdownContainer = $(this).parent();

        if (dropdownContainer.hasClass('open')) {
            $('#multiFilter .filter-toggle').parent().removeClass('open');
        } else {
            $('#multiFilter .filter-toggle').parent().removeClass('open');
            dropdownContainer.addClass('open');
        }
    });

    var searchCondition = {

    };
    // Render table
    let table = $(garages).DataTable({
        dom: "lftipr",
        //data: mockupData,
        language: viDatatables,
        ajax: {
            url: "/api/garages",
            type: "GET",
            //data: searchCondition
        },
        columnDefs: [
            {
                targets: 1,
                render: function (data, type, row) {
                    return `<a href="/management/garageManagement/${row[0]}">${data}</a>`;
                }
            },
			{
			    // Render stars
			    targets: -3,
			    render: (data, type, row) => {
                    if (type === 'display') {
                        if (row[6] > 0) {
                            return renderStarRating(data);
                        }
                        
                        return '-';
                    }
                    return data;
			    }
			},
			{
			    // Render status label
			    targets: -2,
			    render: (data, type) => {
			        if (type === 'display') {
			            return `<div class="status-label" >
							<p class="label label-${data ? 'primary' : 'danger'}">${data ? 'Đang mở cửa' : 'Đã đóng cửa'}</p>
						</div>`;
			        }
			        return data;
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
					    <ul class ="dropdown-menu">
						<li><a href="/management/garageManagement/${row[0]}">Thông tin chi tiết</a></li>

                        ${row[7] === true?
                        `<li><a data-toggle="modal" data-target="#mdModal" data-action="deactivate" data-id="${row[0]}" data-name="${row[1]}" >Đóng cửa garage</a></li>` :
                        `<li><a data-toggle="modal" data-target="#mdModal" data-action="activate" data-id="${row[0]}" data-name="${row[1]}" >Mở cửa garage</a></li>`}
                        <li><a href="#" data-toggle="modal" data-target="#mdModal" data-action="delete" data-id="${row[0]}" data-name="${row[1]}" >Xóa</a></li>
						</ul>
					</div>`;
			    }
			}
        ],
        columns: [
			{ name: 'ID', visible: false },
			{ name: 'Name', title: 'Tên', width: '15%' },
			{ name: 'Address', title: 'Địa chỉ', width: '25%' },
			{ name: 'Location', title: 'Vị trí', width: '10%' },
            { name: 'NumOfVehicle', title: 'Số lượng xe', width: '10%' },
			{ name: 'Stars', title: 'Xếp Hạng', width: '15%' },
            { name: 'NumOfComment', visible: false },
			{ name: 'Status', title: 'Trạng thái', width: '15%' },
			{
			    title: 'Action',
			    width: '10%',
			    orderable: false,
			    searchable: false
			}
        ]
    });

    // Render confirmation modal for actions
    $('#mdModal').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget),
			action = button.data('action')
        id = button.data('id'),
        name = button.data('name');
        switch (action) {
            case "activate": {
                renderConfirmModal(table, 'garage', 'reactivate', this, [{ id: id, name: name }]);
            } break;
            case "deactivate": {
                renderConfirmModal(table, 'garage', 'deactivate', this, [{ id: id, name: name }]);
            } break;
            case "delete": {
                renderConfirmModal(table, 'garage', 'delete', this, [{ id: id, name: name }]);
            } break;
        }

        $(document).on('click', '.btn-yeah', function (event) {
            $("#error").html("");
            var comment = $('#comment').val();
            if (comment == "") {
                $("#error").html("PC name must not be blank!");
                return;
            }
            $.ajax({
                url: '/api/CommentBooking',
                data: {
                    id: id,
                    comment: comment,
                    star: star,
                },
                error: function () {
                    alert("Problem")
                    location.href = "/management/bookingHistory";
                },
                success: function (data) {
                    alert("Comment successfully");
                    location.href = "/management/bookingHistory";
                },
                type: 'POST'
            });
        });
    });

    $('#locationID').select2({
        width: '100%',
    });
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

    $('#btnCreateGarage').on('click', function () {
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
        model.ID = null;
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
            url: '/api/garages',
            type: 'POST',
            data: JSON.stringify(model),
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                $('.modal').modal('hide');
                table.ajax.reload();
            },
            fail: function (e) {
                toastr.error("Tạo mới không thành công. Xin vui lòng thử lại");
            },
            error: function (e) {
                toastr.error("Đã có lỗi xảy ra. Xin vui lòng thử lại sau");
            }
        });
    });
});
