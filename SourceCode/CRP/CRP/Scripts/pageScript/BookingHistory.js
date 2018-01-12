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
	info: "\_START\_ - \_END\_ của \_TOTAL\_ kết quả",
	infoEmpty: "không có dữ liệu",
	infoFiltered: "(được lọc ra từ _MAX_ dòng)"
}

$(document).ready(() => {
	// Render table
	let table = $('#bookingHistory').DataTable({
		dom: "ltipr"
		, orderFixed: [ 3, 'desc' ]
		, processing: true
		, language: viDatatables
		, scrollCollapse: true
		, serverSide: true
		, retrieve: true
		, ajax: {
			url: GetBookingHistoryUrl
			, data: (rawData) => {
				return {
					draw: rawData.draw
					, recordPerPage: rawData.length
					, page: rawData.start / rawData.length + 1
				};
			}
		}
		, columnDefs: [
			{
				// Render vehicleName's link
				targets: 1,
				render: (data, type, row) => {
					if (type === 'display' && row.VehicleID) {
						return `<a target="_blank" href="/vehicleInfo/${row.VehicleID}">${data}</a>`;
					}
					return data;
				}
			},
			{
				// Render start time
				targets: 3,
				render: (data, type) => {
					if (type === 'display') {
						return moment(data).local().format('ddd, DD/MM/YYYY, HH:mm');
					}
					return data;
				}
			},
			{
				// Render end time
				targets: 4,
				render: (data, type) => {
					if (type === 'display') {
						return moment(data).local().format('ddd, DD/MM/YYYY, HH:mm');
					}
					return data;
				}
				
			},
			{
				// Render status label
				targets: 5,
				render: (data, type, row) => {
					if (type === 'display') {
						let labelNode;

						if(row.IsCanceled){
							labelNode = '<div class ="label label-danger">Đã hủy</div>';
						} else if (moment(row.StartTime).isAfter(moment())) {
							labelNode = '<div class ="label label-info" >Đã đặt</div>'
						} else if (moment(row.StartTime).isBefore(moment()) && moment(row.EndTime).isAfter(moment())) {
							labelNode = '<div class ="label label-primary" >Đang thuê</div>';
						} else {
							labelNode = '<div class ="label label-success" >Đã kết thúc</div>';
						}
						return `<div class="status-label" >${labelNode}</div>`;
					}
					return data;
				}
			},
			{
				// Render action button
				targets: 6,
				render: (data, type, row) => {
					return `<div class="btn-group" >
						<button data-toggle="dropdown" class="btn btn-primary dropdown-toggle" aria-expanded="false">
							<i class="fa fa-gear"></i> Thao tác <i class="caret"></i>
						</button>
						<ul class ="dropdown-menu">
							<li><a href="#" data-toggle="modal" data-target="#modal" data-action="detail" data-id="${row.ID}" >Chi tiết</a></li>
							${(moment(row.StartTime).isBefore(moment()) || row.IsCanceled) && !row.HasStar
								? `<li><a href="#" data-toggle="modal" data-target="#modal" data-action="comment" data-id="${row.ID}">Đánh giá</a></li>`
								: ''
							}
							${moment(row.EndTime).isBefore(moment()) || row.IsCanceled
								? ''
								: `<li><a href="#" data-toggle="modal" data-target="#modal" data-action="cancel" data-id="${row.ID}">Hủy đặt xe</a></li>`
							}
						</ul>
					</div>`;
				}
			}
		]
		, columns: [
			{ name: 'ID', data: 'ID', visible: false },
			{ name: 'VehicleName', title: 'Tên xe', data: 'VehicleName', orderable: false, width: '20%' },
			{ name: 'GarageName', title: 'Cửa hàng', data: 'GarageName', orderable: false, width: '20%' },
			{ name: 'StartTime', title: 'Bắt đầu', data: 'StartTime', orderable: false, width: '20%' },
			{ name: 'EndTime', title: 'Kết thúc', data: 'EndTime', orderable: false, width: '20%' },
			{ name: 'Status', title: 'Tình trạng', data: 'IsCanceled', orderable: false, width: '10%' },
			{ title: 'Thao tác', width: '10%', orderable: false }
		]
	});

	// Render confirmation modal for actions
	$('#modal').on('show.bs.modal', function (event) {
		let button = $(event.relatedTarget),
			action = button.data('action'),
			id = button.data('id'),
			data = table.row((i, row) => {
				return row.ID == id;
			}).data();

		switch (action) {
			case 'detail': {
				$(this).html(`<div class="modal-dialog modal-lg" role="document">
					<div class="modal-content">
						<div class="modal-header green-bg">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h2 class="modal-title">
								<span style="border-bottom:1px solid #ccc;">
									Chi tiết đặt xe ${data.VehicleName}
								</span>
							</h2>
							<h3 style="margin-bottom:0;">
								<span>${moment(data.StartTime).local().format('DD/MM/YYYY HH:mm')} <i class="fa fa-arrow-right"></i> ${moment(data.EndTime).local().format('DD/MM/YYYY HH:mm')}</span>
							</h3>
						</div>
						<div class="modal-body">
							<div class="section-header"><b>Chi tiết đơn đặt xe:</b></div>
							<div class="row">
								<div class="col-xs-5 col-xs-offset-1">
									<p><b>Phí thuê xe: </b>${data.RentalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫</p>
									<p><b>Phí dịch vụ: </b>${data.BookingFee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫</p>
								</div>
								<div class="col-xs-6">
									<p><b>Đặt cọc: </b>${data.Deposit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₫</p>
									<p><b>Quãng đường: </b>${data.Distance ? data.Distance + ' km' : 'Không giới hạn'}</p>
								</div>
							</div>
							<hr>
							<div class="section-header"><b>Thông tin xe:</b> ${data.VehicleName}</div>
							<div class="row">
								<div class="col-xs-5 col-xs-offset-1">
									<p><b>Năm sản xuất: </b>${data.Year}</p>
									<p><b>Số ghế: </b>${data.NumOfSeat}</p>
									<p><b>Số cửa: </b>${data.NumOfDoor}</p>
								</div>
								<div class="col-xs-6">
									<p><b>Màu sắc: </b><i class="fa fa-circle" style="color: ${data.Color};"></i></p>
									${data.FuelType
										? `<p><b>Nhiên liệu: </b>${data.FuelType}</p>`
										: ''
									}
									<p><b>Hộp số: </b>${data.TransmissionType}</p>
									${data.TransmissionDetail
										? `<p><b>Chi tiết hộp số: </b>${data.TransmissionDetail}</p>`
										: ''
									}
									${data.Engine
										? `<p><b>Động cơ: </b>${data.Engine}</p>`
										: ''
									}
								</div>
							</div>
							<hr>
							<div class="section-header"><b>Thông tin cửa hàng:</b> ${data.GarageName}</div>
							<div class="row">
								<div class="col-xs-5 col-xs-offset-1">
									<p><b>Điện thoại:</b> <a href="tel:${data.GaragePhone}">+${data.GaragePhone}</a></p>
									
								</div>
								<div class="col-xs-6">
									<p><b>Email:</b> <a href="mailto:${data.GarageEmail}">${data.GarageEmail}</a></p>
								</div>
							</div>
							<div class="row">
								<div class="col-xs-11 col-xs-offset-1">
									<p><b>Địa chỉ:</b> ${data.GarageAddress}</p>
								</div>
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-primary" data-dismiss="modal">Đóng</button>
						</div>
					</div>
				</div>`);
			}
			break;
			case 'comment': {
				$(this).html(`<div class="modal-dialog modal-lg" role="document">
					<div class="modal-content">
						<div class="modal-header green-bg">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h2 class="modal-title">Đánh giá xe ${data.VehicleName}</h2>
						</div>
						<form id="commentForm" action="#">
							<div class="modal-body">
								<div class ="stars stars-example-bootstrap">
									<select id="star" autocomplete="off">
										<option value=""></option>
										<option value="1">1</option>
										<option value="2">2</option>
										<option value="3">3</option>
										<option value="4">4</option>
										<option value="5">5</option>
									</select>
								   <div class="form-group">
										<label for="comment">Đánh giá:</label>
										<textarea class="form-control" rows="5" id="comment" maxlength="200" minlength="20" required></textarea>
									</div>
								</div>
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-default" data-dismiss="modal">Đóng</button>
								<input type="submit" value="Gửi" class="btn btn-primary">
							</div>
						</form>
					</div>
				</div>`);

				$('#star').barrating({
					deselectable: true,
					hoverState: false,
					theme: 'fontawesome-stars',
				});

				$('#commentForm').validate({
					submitHandler: form => {
						$.ajax({
							url: CommentUrl,
							type: 'PATCH',
							contentType: 'application/json; charset=utf-8',
							data: JSON.stringify({comment: {
								ID: data.ID,
								Star: Number.parseInt($(form).find('#star').val()) || 0,
								Comment: $(form).find('#comment').val()
							}}),
						})
						.done(() => {
							toastr.success("Gởi đánh giá thành công.")
						})
						.fail(() => {
							toastr.error("Có lỗi xảy ra. Phiền bạn thử lại sau.")
						})
						.always(() => {
							$('#modal').modal('hide');
							table.ajax.reload();
						});
					}
				});

			}
			break;
			case 'cancel': {
				$(this).html(`<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-header red-bg">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h2 class="modal-title">Hủy đặt xe ${data.VehicleName}</h2>
						</div>
						<div class="modal-body">
							<div class ="stars stars-example-bootstrap">
								<span>Bạn đang chuẩn bị hủy đặt xe <b>${data.VehicleName}</b>. Bạn có chắc chắn?</span>
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Đóng</button>
							<button type="button" class="btn btn-danger" id="cancelBookingBtn">Hủy</button>
						</div>
					</div>
				</div>`);

				$('#cancelBookingBtn').click((evt) => {
					$.ajax({
						url: CancelUrl + '/' + id,
						type: 'DELETE'
					})
					.done(() => {
						toastr.success("Hủy đặt xe thành công.")
					})
					.fail(() => {
						toastr.error("Có lỗi xảy ra. Phiền bạn thử lại sau.")
					})
					.always(() => {
						$('#modal').modal('hide');
						table.ajax.reload();
					});
				});
			}
			break;   
		}
	});
});