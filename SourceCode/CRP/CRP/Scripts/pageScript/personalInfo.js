$(document).ready(function(){
	// Alert if there is message
	if(STATUS_MESSAGE)
		IS_SUCCESS ? toastr.success(STATUS_MESSAGE) : toastr.error(STATUS_MESSAGE)

	// The avatar input
	$('#avatarInput').change(function(event) {
		let file = event.currentTarget.files[0];

		// Check file size
		if((file.size/1024).toFixed(4) > 500){
			toastr.warning('Ảnh đại diện phải dưới 500kb.');

			// Clear the input
			this.value = null;

			// Reset to old avatar or icon
			if(OLD_AVATAR_URL) {
				$('#avatarReview').html(`<img class="avatar-preview" src="${OLD_AVATAR_URL}" onclick="javascript:document.getElementById('avatarInput').click()" >`)
			} else {
				$('#avatarReview').html(`<i class="img-circle fa fa-user-circle" style="color:#4CAF50;cursor:pointer;font-size:200px;" onclick="javascript:document.getElementById('avatarInput').click()" ></i>`)
			}
			
		} else {
			// Render new avatar img review
			let reader = new FileReader();

			reader.onload = function (e) {
				$('#avatarReview').html(`<img class="avatar-preview" src="${e.target.result}" onclick="javascript:document.getElementById('avatarInput').click()" >`)
			}

			reader.readAsDataURL(file);
		}
	});
});