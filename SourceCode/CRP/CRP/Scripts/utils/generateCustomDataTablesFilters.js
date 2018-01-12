// Generate custom filters for datatables
// For simple text search
function createTextFilter(table, filterNode, colName){
	let col = table.column(`${colName}:name`);

	// filter button clicked
	filterNode.find('.dropdown-menu button').click((event) => {
		col.search(filterNode.find('.dropdown-menu input').val()).draw();
		filterNode.find('.filter-toggle').addClass('btn-success');
	});

	// enter pressed
	filterNode.find(".dropdown-menu input").keyup((event) => {
		if (event.keyCode == 13) {
			col.search(event.target.value).draw();
			filterNode.find('.filter-toggle').addClass('btn-success');
		}
	});

	// clear filter event
	filterNode.find('.filter-remove').click((event) => {
		col.search('').draw();
		filterNode.find('.filter-toggle').removeClass('btn-success');
		filterNode.removeClass('open');
	});
}

// For checkbox-like
function createCheckboxFilter(table, filterNode, filterCol){
	let selectedItem = [];

	$.fn.dataTable.ext.search.push((settings, data) => {
		if(selectedItem.length !== 0){
			return selectedItem.find((item) => {
				return data[filterCol] == item
			});
		}
		return true;
	});

	// filter button clicked
	filterNode.find('.dropdown-menu button').click((event) => {
		selectedItem = filterNode.find('input:checked').toArray().map((checkbox) => {
			return checkbox.value;
		});
		if(selectedItem.length !== 0){
			table.draw();
			filterNode.find('.filter-toggle').addClass('btn-success');
		}
	});

	// clear filter event
	filterNode.find('.filter-remove').click((event) => {
		selectedItem = [];
		table.draw();
		filterNode.find('.filter-toggle').removeClass('btn-success');
		filterNode.removeClass('open');
	});
}

// For range-like with int data
function createIntRangeFilter(table, filterNode, filterCol){
	let min, max;

	$.fn.dataTable.ext.search.push((settings, data) => {
		return ( min ? ( data[filterCol] >= min ) : true )
			&& ( max ? ( data[filterCol] <= max ) : true );
	});

	// filter button clicked
	filterNode.find('.dropdown-menu button').click((event) => {
		min = Number.parseInt(filterNode.find('.from-input').val());
		max = Number.parseInt(filterNode.find('.to-input').val());
		table.draw();
		filterNode.find('.filter-toggle').addClass('btn-success');
	});

	// clear filter event
	filterNode.find('.filter-remove').click((event) => {
		min = max = null;
		table.draw();
		filterNode.find('.filter-toggle').removeClass('btn-success');
		filterNode.removeClass('open');
	});
}

// For range-like with float data
function createFloatRangeFilter(table, filterNode, filterCol){
	let min, max;

	$.fn.dataTable.ext.search.push((settings, data) => {
		return ( min ? ( Number.parseFloat(data[filterCol]) >= min ) : true )
			&& ( max ? ( Number.parseFloat(data[filterCol]) <= max ) : true );
	});

	// filter button clicked
	filterNode.find('.dropdown-menu button').click((event) => {
		min = Number.parseFloat(filterNode.find('.from-input').val());
		max = Number.parseFloat(filterNode.find('.to-input').val());
		table.draw();
		filterNode.find('.filter-toggle').addClass('btn-success');
	});

	// clear filter event
	filterNode.find('.filter-remove').click((event) => {
		min = max = null;
		table.draw();
		filterNode.find('.filter-toggle').removeClass('btn-success');
		filterNode.removeClass('open');
	});
}